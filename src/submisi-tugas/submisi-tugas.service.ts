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
  CreateSubmisiTugasDto,
  GetSubmisiTugasByIdRespDto,
  GetSubmisiTugasByTugasIdRespDto,
} from "./submisi-tugas.dto";
import { Pengguna } from "src/entities/pengguna.entity";
import { Tugas } from "src/entities/tugas.entity";
import { RegStatus } from "src/entities/pendaftaranTesis.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";

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
  private async getPeriode() {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    return currPeriod;
  }

  private async isMahasiswaSubmisiTugas(
    submisiTugasId: string,
    mahasiswaId: string,
  ) {
    const submisiTugas = await this.submisiTugasRepo.findOne({
      where: { id: submisiTugasId },
    });

    if (!submisiTugas) {
      throw new NotFoundException("Submisi tugas tidak ditemukan");
    }

    return submisiTugas.mahasiswaId === mahasiswaId;
  }

  private async isPengajarSubmisiTugas(
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

    const isPengajarTugas = await this.tugasService.isPengajarTugas(
      pengajarId,
      submisiTugas.tugas.id,
    );

    return isPengajarTugas;
  }

  async createSubmisiTugas(
    createDto: CreateSubmisiTugasDto,
    mahasiswaId: string,
  ) {
    const isMahasiswaTugas = await this.tugasService.isMahasiswaTugas(
      mahasiswaId,
      createDto.tugasId,
    );

    if (!isMahasiswaTugas) {
      throw new ForbiddenException("Mahasiswa tidak terdaftar pada kelas");
    }

    const tugas = await this.tugasRepo.findOneBy({ id: createDto.tugasId });
    const mahasiswa = await this.penggunaRepo.findOneBy({ id: mahasiswaId });

    const berkasSubmisiTugas = createDto.berkasSubmisiTugas.map(
      (berkasSubmisiTugas) =>
        this.berkasSubmisiTugasRepo.create(berkasSubmisiTugas),
    );

    const submisiTugas = this.submisiTugasRepo.create({
      ...createDto,
      mahasiswa,
      submittedAt: createDto.isSubmitted ? new Date() : null,
      tugas,
      berkasSubmisiTugas,
    });

    await this.submisiTugasRepo.save(submisiTugas);

    return submisiTugas;
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
      const isMahasiswaSubmisiTugas = await this.isMahasiswaSubmisiTugas(
        id,
        mahasiswaId,
      );
      if (!isMahasiswaSubmisiTugas) {
        throw new ForbiddenException("Anda tidak memiliki akses");
      }
    }

    if (pengajarId) {
      const isPengajarSubmisiTugas = await this.isPengajarSubmisiTugas(
        id,
        pengajarId,
      );
      if (!isPengajarSubmisiTugas) {
        throw new ForbiddenException("Anda tidak memiliki akses");
      }
    }

    const currPeriod = await this.getPeriode();

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
    order: "ASC" | "DESC",
  ) {
    const isPengajarTugas = await this.tugasService.isPengajarTugas(
      idPenerima,
      tugasId,
    );

    if (!isPengajarTugas) {
      throw new ForbiddenException("Anda tidak memiliki akses");
    }

    const submisiTugas = await this.mahasiswaKelasRepo
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
      .orderBy("mahasiswa.nim", order)
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
