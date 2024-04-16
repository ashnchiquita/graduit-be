import {
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
  TugasIdDto,
  UpdateTugasDto,
} from "./tugas.dto";
import { BerkasTugas } from "src/entities/berkasTugas.entity";
import { SubmisiTugas } from "src/entities/submisiTugas.entity";
import { PengajarKelas } from "src/entities/pengajarKelas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas";
import { Kelas } from "src/entities/kelas.entity";
import { Pengguna } from "src/entities/pengguna.entity";

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
  ) {}

  private async isPengajarKelas(pengajarId: string, kelasId: string) {
    const doskel = await this.doskelRepo.findOne({
      where: { pengajarId, kelasId },
    });

    return !!doskel;
  }

  private async isMahasiswaKelas(mahasiswaId: string, kelasId: string) {
    const mahasiswaKelas = await this.mahasiswaKelasRepo.findOne({
      where: { mahasiswaId, kelasId },
    });

    return !!mahasiswaKelas;
  }

  async isPengajarTugas(pengajarId: string, tugasId: string) {
    const tugas = await this.tugasRepo.findOne({
      where: { id: tugasId },
    });

    if (!tugas) {
      throw new NotFoundException("Tugas tidak ditemukan");
    }

    return await this.isPengajarKelas(pengajarId, tugas.kelasId);
  }

  async isMahasiswaTugas(mahasiswaId: string, tugasId: string) {
    const tugas = await this.tugasRepo.findOne({
      where: { id: tugasId },
    });

    if (!tugas) {
      throw new NotFoundException("Tugas tidak ditemukan");
    }

    return await this.isMahasiswaKelas(mahasiswaId, tugas.kelasId);
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
    const isPengajarKelas = await this.isPengajarKelas(
      pembuatId,
      createDto.kelasId,
    );

    if (!isPengajarKelas) {
      throw new ForbiddenException("Anda bukan pengajar kelas ini");
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
    const isPengajarTugas = await this.isPengajarTugas(
      pengubahId,
      updateDto.id,
    );

    if (!isPengajarTugas) {
      throw new ForbiddenException("Anda bukan pengajar kelas ini");
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
      const isMahasiswaTugas = await this.isMahasiswaTugas(idMahasiswa, id);

      if (!isMahasiswaTugas) {
        throw new ForbiddenException("Anda bukan mahasiswa kelas ini");
      }
    }

    if (idPengajar) {
      const isPengajarTugas = await this.isPengajarTugas(idPengajar, id);

      if (!isPengajarTugas) {
        throw new ForbiddenException("Anda bukan pengajar kelas ini");
      }
    }

    // const result: GetTugasByIdRespDto = await this.getTugas(id);
    const result = await this.getTugas(id);

    return result;
  }
}
