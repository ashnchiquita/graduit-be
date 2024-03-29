import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  PendaftaranTesis,
  RegStatus,
} from "../entities/pendaftaranTesis.entity";
import { JalurEnum } from "../entities/pendaftaranTesis.entity";
import { Pengguna } from "../entities/pengguna.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { DashboardDto } from "./dashboard.dto";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(Konfigurasi)
    private konfigurasiRepository: Repository<Konfigurasi>,
  ) {}

  async findAll(): Promise<PendaftaranTesis[]> {
    return this.pendaftaranTesisRepository.find({
      relations: ["mahasiswa", "topik"],
    });
  }

  async findByPenerimaId(penerimaId: string): Promise<DashboardDto[]> {
    const currentPeriode = await this.konfigurasiRepository.findOne({
      where: { key: process.env.KONF_PERIODE_KEY },
    });

    const pendaftaranTesis = await this.pendaftaranTesisRepository.find({
      where: {
        status: RegStatus.APPROVED,
        penerima: {
          id: penerimaId,
        },
        topik: {
          periode: currentPeriode.value,
        },
      },
      relations: {
        mahasiswa: true,
        topik: true,
      },
    });

    return pendaftaranTesis.map((pendaftaran) => ({
      id: pendaftaran.id,
      jalurPilihan: pendaftaran.jalurPilihan,
      status: "LANCAR",
      topik: {
        id: pendaftaran.topik.id,
        judul: pendaftaran.topik.judul,
      },
      mahasiswa: {
        id: pendaftaran.mahasiswa.id,
        nama: pendaftaran.mahasiswa.nama,
        nim: pendaftaran.mahasiswa.nim,
      },
    }));
  }

  async getStatisticsByJalurPilihan(
    penerimaId: string,
  ): Promise<{ jalurPilihan: JalurEnum; count: number }[]> {
    const [currentPeriode, penerima] = await Promise.all([
      this.konfigurasiRepository.findOne({
        where: { key: process.env.KONF_PERIODE_KEY },
      }),
      this.penggunaRepository.findOne({
        where: { id: penerimaId },
      }),
    ]);

    if (!penerima) {
      return [];
    }
    const statistics = await this.pendaftaranTesisRepository
      .createQueryBuilder("pendaftaranTesis")
      .select("pendaftaranTesis.jalurPilihan", "jalurPilihan")
      .addSelect("COUNT(*)", "count")
      .leftJoinAndSelect("pendaftaranTesis.topik", "topik")
      .where("pendaftaranTesis.penerima = :penerima", { penerima: penerima.id })
      .andWhere("pendaftaranTesis.status = :status", {
        status: RegStatus.APPROVED,
      })
      .groupBy("pendaftaranTesis.jalurPilihan")
      .addGroupBy("topik.id")
      .having("topik.periode = :periode", {
        periode: currentPeriode.value,
      })
      .getRawMany();
    return statistics;
  }
}
