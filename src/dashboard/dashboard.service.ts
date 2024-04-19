import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import {
  PendaftaranTesis,
  RegStatus,
} from "../entities/pendaftaranTesis.entity";
import { Pengguna } from "../entities/pengguna.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { Bimbingan } from "src/entities/bimbingan.entity";
import {
  DashboardDto,
  DashboardMahasiswaResDto,
  JalurStatisticDto,
  NoNIMUserDashboard,
} from "./dashboard.dto";
import {
  PendaftaranSidsem,
  TipeSidsemEnum,
} from "src/entities/pendaftaranSidsem";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { BimbinganService } from "src/bimbingan/bimbingan.service";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(Konfigurasi)
    private konfigurasiRepository: Repository<Konfigurasi>,
    @InjectRepository(Bimbingan)
    private bimbinganRepository: Repository<Bimbingan>,
    @InjectRepository(PendaftaranSidsem)
    private pendaftaranSidsemRepository: Repository<PendaftaranSidsem>,
    @InjectRepository(DosenBimbingan)
    private dosenBimbinganRepository: Repository<DosenBimbingan>,
    private bimbinganService: BimbinganService,
  ) {}

  async findAll(): Promise<PendaftaranTesis[]> {
    return this.pendaftaranTesisRepository.find({
      relations: ["mahasiswa", "topik"],
    });
  }

  async findByDosenId(
    dosenId: string,
    search?: string,
  ): Promise<DashboardDto[]> {
    const currentPeriode = await this.konfigurasiRepository.findOne({
      where: { key: process.env.KONF_PERIODE_KEY },
    });

    if (!currentPeriode) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    let pendaftaranTesisQuery = this.pendaftaranTesisRepository
      .createQueryBuilder("pendaftaranTesis")
      .leftJoinAndSelect("pendaftaranTesis.mahasiswa", "mahasiswa")
      .leftJoinAndSelect("pendaftaranTesis.topik", "topik")
      .innerJoin(
        "pendaftaranTesis.dosenBimbingan",
        "dosenBimbingan",
        "dosenBimbingan.idDosen = :dosenId",
        {
          dosenId,
        },
      )
      .andWhere("pendaftaranTesis.status = :status", {
        status: RegStatus.APPROVED,
      })
      .andWhere("topik.periode = :periode", { periode: currentPeriode.value });

    if (search) {
      pendaftaranTesisQuery = pendaftaranTesisQuery.andWhere(
        new Brackets((qb) => {
          qb.where("mahasiswa.nama ILIKE :search", {
            search: `%${search}%`,
          }).orWhere("mahasiswa.nim ILIKE :search", { search: `%${search}%` });
        }),
      );
    }
    const pendaftaranTesis = await pendaftaranTesisQuery.getMany();

    const statusMap = await Promise.all(
      pendaftaranTesis.map(async (pendaftaran) => {
        return await this.bimbinganService.getBimbinganStatus(pendaftaran);
      }),
    );

    return pendaftaranTesis.map((pendaftaran, index) => {
      return {
        id: pendaftaran.id,
        jalurPilihan: pendaftaran.jalurPilihan,
        status: statusMap[index],
        topik: {
          id: pendaftaran.topik.id,
          judul: pendaftaran.topik.judul,
        },
        mahasiswa: {
          id: pendaftaran.mahasiswa.id,
          nama: pendaftaran.mahasiswa.nama,
          nim: pendaftaran.mahasiswa.nim,
        },
      };
    });
  }

  async getStatisticsByJalurPilihan(
    dosenId: string,
  ): Promise<JalurStatisticDto[]> {
    const [currentPeriode, dosen] = await Promise.all([
      this.konfigurasiRepository.findOne({
        where: { key: process.env.KONF_PERIODE_KEY },
      }),
      this.penggunaRepository.findOne({
        where: { id: dosenId },
      }),
    ]);

    if (!dosen) {
      throw new BadRequestException("Dosen tidak ditemukan");
    }

    const statistics = await this.pendaftaranTesisRepository
      .createQueryBuilder("pendaftaranTesis")
      .select("pendaftaranTesis.jalurPilihan", "jalurPilihan")
      .addSelect("COUNT(*)", "count")
      .leftJoin("pendaftaranTesis.topik", "topik", "topik.periode = :periode", {
        periode: currentPeriode.value,
      })
      .innerJoin(
        "pendaftaranTesis.dosenBimbingan",
        "dosenBimbingan",
        "dosenBimbingan.idDosen = :dosenId",
        {
          dosenId,
        },
      )
      .andWhere("pendaftaranTesis.status = :status", {
        status: RegStatus.APPROVED,
      })
      .groupBy("pendaftaranTesis.jalurPilihan")
      .getRawMany();

    return statistics as JalurStatisticDto[];
  }

  async getDashboardMahasiswa(
    mahasiswaId: string,
  ): Promise<DashboardMahasiswaResDto> {
    const currentPeriode = await this.konfigurasiRepository.findOne({
      where: { key: process.env.KONF_PERIODE_KEY },
    });

    const mahasiswaQuery = this.penggunaRepository
      .createQueryBuilder("pengguna")
      .select([
        "pengguna.id",
        "pengguna.nama",
        "pengguna.email",
        "pengguna.nim",
      ])
      .where("pengguna.id = :id", { id: mahasiswaId });
    const pendaftaranTesisQuery = this.pendaftaranTesisRepository
      .createQueryBuilder("pendaftaranTesis")
      .select([
        "pendaftaranTesis.id",
        "pendaftaranTesis.jalurPilihan",
        "pendaftaranTesis.waktuPengiriman",
        "pendaftaranTesis.jadwalInterview",
        "pendaftaranTesis.waktuKeputusan",
        "pendaftaranTesis.status",
        "penerima.id",
        "penerima.nama",
        "penerima.email",
      ])
      .leftJoin("pendaftaranTesis.mahasiswa", "mahasiswa")
      .leftJoinAndSelect("pendaftaranTesis.topik", "topik")
      .leftJoin("pendaftaranTesis.penerima", "penerima")
      .where("mahasiswa.id = :id", { id: mahasiswaId })
      .andWhere("topik.periode = :periode", { periode: currentPeriode.value })
      .orderBy("pendaftaranTesis.waktuPengiriman", "DESC");

    const [mahasiswa, pendaftaranTesis] = await Promise.all([
      mahasiswaQuery.getOne(),
      pendaftaranTesisQuery.getOne(),
    ]);

    let dosenBimbingan: DosenBimbingan[] = [];
    let bimbingan: Bimbingan[] = [];
    let seminarSatu: PendaftaranSidsem | null = null;
    let seminarDua: PendaftaranSidsem | null = null;
    let sidang: PendaftaranSidsem | null = null;

    if (pendaftaranTesis) {
      const dosenBimbinganQuery = this.dosenBimbinganRepository
        .createQueryBuilder("dosenBimbingan")
        .select(["dosen.id", "dosen.nama", "dosen.email"])
        .leftJoin("dosenBimbingan.dosen", "dosen")
        .where("dosenBimbingan.idPendaftaran = :id", {
          id: pendaftaranTesis.id,
        });
      const bimbinganQuery = this.bimbinganRepository
        .createQueryBuilder("bimbingan")
        .leftJoinAndSelect("bimbingan.berkas", "berkas")
        .where("bimbingan.pendaftaranId = :id", {
          id: pendaftaranTesis.id,
        });
      const [seminarSatuQuery, seminarDuaQuery, sidangQuery] = Object.values(
        TipeSidsemEnum,
      ).map((tipe) => {
        let temp = this.pendaftaranSidsemRepository
          .createQueryBuilder("pendaftaranSidsem")
          .leftJoinAndSelect("pendaftaranSidsem.ruangan", "ruangan")
          .where("pendaftaranSidsem.pendaftaranTesisId = :id", {
            id: pendaftaranTesis.id,
          })
          .andWhere("pendaftaranSidsem.tipe = :tipe", {
            tipe,
          })
          .andWhere("NOT pendaftaranSidsem.ditolak");

        if (tipe !== TipeSidsemEnum.SEMINAR_1) {
          temp = temp
            .leftJoinAndSelect("pendaftaranSidsem.penguji", "penguji")
            .leftJoinAndSelect("penguji.dosen", "dosen");
        }

        return temp;
      });

      [dosenBimbingan, bimbingan, seminarSatu, seminarDua, sidang] =
        await Promise.all([
          dosenBimbinganQuery.getMany(),
          bimbinganQuery.getMany(),
          seminarSatuQuery.getOne(),
          seminarDuaQuery.getOne(),
          sidangQuery.getOne(),
        ]);
    }

    return {
      mahasiswa,
      pendaftaranTesis,
      dosenBimbingan:
        dosenBimbingan.length > 0
          ? (dosenBimbingan as any as NoNIMUserDashboard[])
          : [pendaftaranTesis.penerima],
      bimbingan,
      seminarSatu,
      seminarDua: {
        ...seminarDua,
        penguji: seminarDua?.penguji.map((p) => ({
          id: p.dosen.id,
          nama: p.dosen.nama,
          email: p.dosen.email,
        })),
      },
      sidang: {
        ...sidang,
        penguji: sidang?.penguji.map((p) => ({
          id: p.dosen.id,
          nama: p.dosen.nama,
          email: p.dosen.email,
        })),
      },
    };
  }
}
