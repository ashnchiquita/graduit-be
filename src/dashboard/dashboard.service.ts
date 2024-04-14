import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import {
  PendaftaranTesis,
  RegStatus,
} from "../entities/pendaftaranTesis.entity";
import { Pengguna } from "../entities/pengguna.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { DashboardDto, JalurStatisticDto } from "./dashboard.dto";
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
    penerimaId: string,
  ): Promise<JalurStatisticDto[]> {
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
      .leftJoin("pendaftaranTesis.topik", "topik")
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
    return statistics as JalurStatisticDto[];
  }
}
