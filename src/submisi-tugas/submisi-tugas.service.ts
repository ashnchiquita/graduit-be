import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BerkasSubmisiTugas } from "src/entities/berkasSubmisiTugas.entity";
import { SubmisiTugas } from "src/entities/submisiTugas.entity";
import { TugasService } from "src/tugas/tugas.service";
import { Brackets, Repository } from "typeorm";
import {
  CreateOrUpdateSubmisiTugasDto,
  GetSubmisiTugasByIdRespDto,
  GetSubmisiTugasByTugasIdRespDto,
  SubmisiTugasIdDto,
} from "./submisi-tugas.dto";
import { Pengguna } from "src/entities/pengguna.entity";
import { Tugas } from "src/entities/tugas.entity";
import { RegStatus } from "src/entities/pendaftaranTesis.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";
import * as dayjs from "dayjs";

@Injectable()
export class SubmisiTugasService {
  constructor(
    @InjectRepository(SubmisiTugas)
    private submisiTugasRepo: Repository<SubmisiTugas>,
    @InjectRepository(BerkasSubmisiTugas)
    private berkasSubmisiTugasRepo: Repository<BerkasSubmisiTugas>,
    @InjectRepository(Pengguna)
    private penggunaRepo: Repository<Pengguna>,
    @InjectRepository(Tugas)
    private tugasRepo: Repository<Tugas>,
    @InjectRepository(MahasiswaKelas)
    private mahasiswaKelasRepo: Repository<MahasiswaKelas>,
    private tugasService: TugasService,
    private konfService: KonfigurasiService,
  ) {}
  private async isMahasiswaSubmisiTugasOrFail(
    submisiTugasId: string,
    mahasiswaId: string,
  ) {
    const submisiTugas = await this.submisiTugasRepo.findOne({
      where: { id: submisiTugasId },
    });

    if (!submisiTugas) {
      throw new NotFoundException("Submisi tugas tidak ditemukan");
    }

    if (submisiTugas.mahasiswaId !== mahasiswaId) {
      throw new ForbiddenException("Anda tidak memiliki akses");
    }

    // validate periode
    await this.tugasService.isMahasiswaTugasOrFail(
      mahasiswaId,
      submisiTugas.tugasId,
    );
  }

  private async isPengajarSubmisiTugasOrFail(
    submisiTugasId: string,
    pengajarId: string,
  ) {
    const submisiTugas = await this.submisiTugasRepo.findOne({
      where: { id: submisiTugasId },
      relations: ["tugas"],
    });

    if (!submisiTugas) {
      throw new NotFoundException("Submisi tugas tidak ditemukan");
    }

    await this.tugasService.isPengajarTugasOrFail(
      pengajarId,
      submisiTugas.tugas.id,
    );
  }

  async upsertSubmisiTugas(
    dto: CreateOrUpdateSubmisiTugasDto,
    mahasiswaId: string,
  ): Promise<SubmisiTugasIdDto> {
    await this.tugasService.isMahasiswaTugasOrFail(mahasiswaId, dto.tugasId);

    // const tugas = await this.tugasRepo.findOne({
    //   where: { id: dto.tugasId, submisiTugas: { mahasiswaId } },
    //   relations: {
    //     submisiTugas: true,
    //   },
    // });

    const tugas = await this.tugasRepo
      .createQueryBuilder("tugas")
      .leftJoinAndSelect(
        "tugas.submisiTugas",
        "submisiTugas",
        "submisiTugas.mahasiswaId = :mahasiswaId",
        { mahasiswaId },
      )
      .where("tugas.id = :id", { id: dto.tugasId })
      .getOne();

    const mahasiswa = await this.penggunaRepo.findOneBy({ id: mahasiswaId });

    const berkasSubmisiTugas = dto.berkasSubmisiTugas.map(
      (berkasSubmisiTugas) =>
        this.berkasSubmisiTugasRepo.create(berkasSubmisiTugas),
    );

    // check deadline
    if (dayjs(new Date()).isAfter(dayjs(new Date(tugas.waktuSelesai)))) {
      throw new ForbiddenException("Tugas sudah melewati deadline");
    }

    if (!dto.id) {
      // create
      // no duplicate
      if (tugas.submisiTugas.length > 0) {
        throw new ForbiddenException("Submisi tugas sudah ada");
      }

      const submisiTugas = this.submisiTugasRepo.create({
        ...dto,
        mahasiswa,
        submittedAt: dto.isSubmitted ? new Date() : null,
        tugas,
        berkasSubmisiTugas,
      });

      const result = await this.submisiTugasRepo.save(submisiTugas);

      return { id: result.id };
    } else {
      // update
      // check if submisi tugas exists
      if (tugas.submisiTugas.length === 0) {
        throw new BadRequestException("Submisi tugas belum ada");
      }

      // check if submisi tugas id is valid
      if (tugas.submisiTugas[0].id !== dto.id) {
        throw new NotFoundException("Submisi tugas tidak ditemukan");
      }

      // check if submisi tugas is already submitted
      if (tugas.submisiTugas[0].isSubmitted) {
        throw new ForbiddenException("Submisi tugas sudah dikumpulkan");
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { submisiTugas: _, ...omittedTugas } = tugas;

      const data = {
        ...tugas.submisiTugas[0],
        ...dto,
        berkasSubmisiTugas,
        mahasiswa,
        tugas: omittedTugas,
        submittedAt: dto.isSubmitted ? new Date() : null,
      };

      await this.submisiTugasRepo.save(data);

      return { id: dto.id };
    }
  }

  private async getSubmisiTugas(id: string) {
    const submisiTugas = await this.submisiTugasRepo.findOne({
      where: { id },
      relations: ["berkasSubmisiTugas"],
    });

    if (!submisiTugas) {
      throw new NotFoundException("Submisi tugas tidak ditemukan");
    }

    return submisiTugas;
  }

  async getSubmisiTugasById(
    id: string,
    mahasiswaId?: string,
    pengajarId?: string,
  ) {
    if (mahasiswaId) {
      await this.isMahasiswaSubmisiTugasOrFail(id, mahasiswaId);
    }

    if (pengajarId) {
      await this.isPengajarSubmisiTugasOrFail(id, pengajarId);
    }

    const currPeriod = await this.konfService.getPeriodeOrFail();
    const submisiTugas = await this.getSubmisiTugas(id);

    const pendaftaranQuery = this.penggunaRepo
      .createQueryBuilder("pengguna")
      .select([
        "pengguna.id",
        "pengguna.nama",
        "pengguna.email",
        "pendaftaranTesis.jalurPilihan",
        "pendaftaranTesis.waktuPengiriman",
        "topik.id",
        "topik.judul",
        "topik.deskripsi",
      ])
      .leftJoinAndSelect("pengguna.pendaftaranTesis", "pendaftaranTesis")
      .leftJoinAndSelect("pendaftaranTesis.topik", "topik")
      .where("pengguna.id = :id", { id: submisiTugas.mahasiswaId })
      .andWhere("pendaftaranTesis.status = :status", {
        status: RegStatus.APPROVED,
      })
      .andWhere("topik.periode = :periode", { periode: currPeriod })
      .getOne();

    const [tugas, pendaftaran] = await Promise.all([
      this.tugasService.getTugasById(submisiTugas.tugasId),
      pendaftaranQuery,
    ]);

    const result: GetSubmisiTugasByIdRespDto = {
      tugas,
      submisiTugas,
      pendaftaran: {
        ...pendaftaran,
        pendaftaranTesis:
          pendaftaran.pendaftaranTesis.length > 0
            ? pendaftaran.pendaftaranTesis[0]
            : undefined,
      },
    };

    return result;
  }

  async getSubmisiTugasByTugasId(
    tugasId: string,
    idPenerima: string,
    search: string,
    page: number,
    limit: number,
    order: "ASC" | "DESC",
    isSubmitted?: boolean,
  ) {
    await this.tugasService.isPengajarTugasOrFail(idPenerima, tugasId);

    const baseQuery = this.mahasiswaKelasRepo
      .createQueryBuilder("mk")
      .innerJoin("mk.kelas", "kelas", "kelas.id = mk.kelasId")
      .innerJoinAndSelect("mk.mahasiswa", "mahasiswa")
      .leftJoinAndSelect(
        "mahasiswa.submisiTugas",
        "submisiTugas",
        "submisiTugas.tugasId = :tugasId",
        { tugasId },
      )
      .leftJoinAndSelect(
        "submisiTugas.berkasSubmisiTugas",
        "berkasSubmisiTugas",
      )
      .select([
        "mk.id",
        "mahasiswa.id",
        "mahasiswa.nim",
        "mahasiswa.nama",
        "submisiTugas.id",
        "submisiTugas.isSubmitted",
        "berkasSubmisiTugas",
      ])
      .distinctOn(["mahasiswa.nim"])
      .where(
        new Brackets((qb) => {
          qb.where("mahasiswa.nama ILIKE :search", {
            search: `%${search}%`,
          }).orWhere("mahasiswa.nim ILIKE :search", { search: `%${search}%` });
        }),
      )
      .orderBy("mahasiswa.nim", order);

    if (isSubmitted !== undefined) {
      if (isSubmitted) {
        baseQuery.andWhere("submisiTugas.isSubmitted = true");
      } else {
        baseQuery.andWhere(
          new Brackets((qb) =>
            qb
              .where("submisiTugas.isSubmitted <> true")
              .orWhere("submisiTugas.isSubmitted IS NULL"),
          ),
        );
      }
    }

    const submisiTugas = await baseQuery
      .limit(limit)
      .skip((page - 1) * limit)
      .getMany();

    const mappedResult: GetSubmisiTugasByTugasIdRespDto[] = submisiTugas.map(
      (submisi) => ({
        id: submisi.mahasiswa.id,
        nim: submisi.mahasiswa.nim,
        nama: submisi.mahasiswa.nama,
        submisiTugas:
          submisi.mahasiswa.submisiTugas.length > 0
            ? submisi.mahasiswa.submisiTugas[0]
            : undefined,
      }),
    );

    return mappedResult;
  }
}
