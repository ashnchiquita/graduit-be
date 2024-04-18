import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tugas } from "src/entities/tugas.entity";
import { Repository } from "typeorm";
import {
  CreateTugasDto,
  GetTugasByIdRespDto,
  GetTugasByKelasIdRespDto,
  GetTugasSummaryRespDto,
  TugasIdDto,
  UpdateTugasDto,
} from "./tugas.dto";
import { BerkasTugas } from "src/entities/berkasTugas.entity";
import { SubmisiTugas } from "src/entities/submisiTugas.entity";
import { PengajarKelas } from "src/entities/pengajarKelas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";
import { Kelas } from "src/entities/kelas.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { KelasService } from "src/kelas/kelas.service";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import * as dayjs from "dayjs";

@Injectable()
export class TugasService {
  constructor(
    @InjectRepository(Tugas) private tugasRepo: Repository<Tugas>,
    @InjectRepository(BerkasTugas)
    private berkasTugasRepo: Repository<BerkasTugas>,
    @InjectRepository(SubmisiTugas)
    private submisiTugasRepo: Repository<SubmisiTugas>,
    @InjectRepository(PengajarKelas)
    private doskelRepo: Repository<PengajarKelas>,
    @InjectRepository(MahasiswaKelas)
    private mahasiswaKelasRepo: Repository<MahasiswaKelas>,
    @InjectRepository(Kelas)
    private kelasRepo: Repository<Kelas>,
    @InjectRepository(Pengguna)
    private penggunaRepo: Repository<Pengguna>,
    private kelasService: KelasService,
    private konfService: KonfigurasiService,
  ) {}

  private async isPengajarKelasOrFail(pengajarId: string, kelasId: string) {
    const periode = await this.konfService.getPeriodeOrFail();

    const doskel = await this.doskelRepo.findOne({
      where: {
        pengajarId,
        kelasId,
        kelas: {
          periode,
        },
      },
      relations: ["kelas"],
    });

    if (!doskel) {
      throw new ForbiddenException("Anda tidak memiliki akses");
    }
  }

  private async isMahasiswaKelasOrFail(mahasiswaId: string, kelasId: string) {
    const periode = await this.konfService.getPeriodeOrFail();

    const mahasiswaKelas = await this.mahasiswaKelasRepo.findOne({
      where: {
        mahasiswaId,
        kelasId,
        kelas: {
          periode,
        },
      },
      relations: ["kelas"],
    });

    if (!mahasiswaKelas) {
      throw new ForbiddenException("Anda tidak memiliki akses");
    }
  }

  async isPengajarTugasOrFail(pengajarId: string, tugasId: string) {
    const tugas = await this.tugasRepo.findOne({
      where: { id: tugasId },
    });

    if (!tugas) {
      throw new NotFoundException("Tugas tidak ditemukan");
    }

    await this.isPengajarKelasOrFail(pengajarId, tugas.kelasId);
  }

  async isMahasiswaTugasOrFail(mahasiswaId: string, tugasId: string) {
    const tugas = await this.tugasRepo.findOne({
      where: { id: tugasId },
    });

    if (!tugas) {
      throw new NotFoundException("Tugas tidak ditemukan");
    }

    return await this.isMahasiswaKelasOrFail(mahasiswaId, tugas.kelasId);
  }

  private async getTugas(tugasId: string): Promise<GetTugasByIdRespDto> {
    const result: GetTugasByIdRespDto[] = await this.tugasRepo
      .createQueryBuilder("tugas")
      .leftJoinAndSelect("tugas.pembuat", "pembuat")
      .leftJoinAndSelect("tugas.pengubah", "pengubah")
      .leftJoinAndSelect("tugas.kelas", "kelas")
      .leftJoinAndSelect("kelas.mataKuliah", "mataKuliah")
      .leftJoinAndSelect("tugas.berkasTugas", "berkasTugas")
      .select([
        "tugas.id",
        "pembuat.id",
        "pembuat.nama",
        "pengubah.id",
        "pengubah.nama",
        "tugas.judul",
        "tugas.waktuMulai",
        "tugas.waktuSelesai",
        "tugas.deskripsi",
        "tugas.createdAt",
        "tugas.updatedAt",
        "berkasTugas",
        "kelas.id",
        "kelas.nomor",
        "mataKuliah.kode",
        "mataKuliah.nama",
      ])
      .where("tugas.id = :tugasId", { tugasId })
      .getMany();

    return result[0];
  }

  async createTugas(
    createDto: CreateTugasDto,
    pembuatId: string,
  ): Promise<TugasIdDto> {
    await this.isPengajarKelasOrFail(pembuatId, createDto.kelasId);

    if (dayjs(createDto.waktuMulai).isAfter(dayjs(createDto.waktuSelesai))) {
      throw new BadRequestException(
        "Waktu mulai tidak boleh setelah waktu selesai",
      );
    }

    const kelas = await this.kelasRepo.findOne({
      where: { id: createDto.kelasId },
    });

    const pembuat = await this.penggunaRepo.findOne({
      where: { id: pembuatId },
    });

    const berkasTugas = createDto.berkasTugas.map((berkas) =>
      this.berkasTugasRepo.create(berkas),
    );

    const tugas = this.tugasRepo.create({
      ...createDto,
      kelas,
      pembuat,
      pengubah: pembuat,
      berkasTugas,
    });

    const result = await this.tugasRepo.save(tugas);

    return { id: result.id };
  }

  async updateTugasById(
    updateDto: UpdateTugasDto,
    pengubahId: string,
  ): Promise<TugasIdDto> {
    await this.isPengajarTugasOrFail(pengubahId, updateDto.id);

    if (dayjs(updateDto.waktuMulai).isAfter(dayjs(updateDto.waktuSelesai))) {
      throw new BadRequestException(
        "Waktu mulai tidak boleh setelah waktu selesai",
      );
    }

    const berkasTugas = updateDto.berkasTugas.map((berkas) =>
      this.berkasTugasRepo.create(berkas),
    );

    const pengubah = await this.penggunaRepo.findOne({
      where: { id: pengubahId },
    });

    const prevTugas = await this.tugasRepo.findOne({
      where: { id: updateDto.id },
      relations: ["kelas", "pembuat"],
    });

    const data = {
      ...updateDto,
      updatedAt: new Date(),
      pengubah,
      kelas: prevTugas.kelas,
      pembuat: prevTugas.pembuat,
      berkasTugas,
    };

    await this.tugasRepo.save(data);

    return { id: updateDto.id };
  }

  async getTugasById(id: string, idMahasiswa?: string, idPengajar?: string) {
    if (idMahasiswa) {
      await this.isMahasiswaTugasOrFail(idMahasiswa, id);
    }

    if (idPengajar) {
      await this.isPengajarTugasOrFail(idPengajar, id);
    }

    const result = await this.getTugas(id);

    return result;
  }

  async getTugasByKelasId(
    kelasId: string,
    idPengajar: string,
    search: string,
    page: number,
    limit: number,
  ): Promise<GetTugasByKelasIdRespDto> {
    await this.isPengajarKelasOrFail(idPengajar, kelasId);

    const kelasQuery = this.kelasService.getById(kelasId);
    const tugasQuery = await this.tugasRepo
      .createQueryBuilder("tugas")
      .leftJoinAndSelect(
        "tugas.submisiTugas",
        "submisi_tugas",
        "submisi_tugas.isSubmitted = true",
      )
      .select([
        "tugas.id AS id",
        "tugas.judul AS judul",
        "tugas.waktuMulai AS waktu_mulai",
        "tugas.waktuSelesai AS waktu_selesai",
        "COUNT(submisi_tugas) AS total_submisi",
      ])
      .where("tugas.kelasId = :kelasId", {
        kelasId,
      })
      .andWhere("tugas.judul ILIKE :search", { search: `%${search}%` })
      .groupBy("tugas.id")
      .orderBy("tugas.createdAt", "DESC")
      .limit(limit)
      .skip((page - 1) * limit)
      .getRawMany();

    const [kelas, tugas] = await Promise.all([kelasQuery, tugasQuery]);
    const mappedTugas: GetTugasSummaryRespDto[] = tugas.map((tugas) => ({
      id: tugas.id,
      judul: tugas.judul,
      waktuMulai: tugas.waktu_mulai,
      waktuSelesai: tugas.waktu_selesai,
      totalSubmisi: parseInt(tugas.total_submisi),
    }));

    return { kelas, tugas: mappedTugas };
  }
}
