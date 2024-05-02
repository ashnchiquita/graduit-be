import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import {
  PendaftaranTesis,
  RegStatus,
} from "../entities/pendaftaranTesis.entity";
import { Pengguna } from "../entities/pengguna.entity";
import { DashboardDto, JalurStatisticDto } from "./dashboard.dto";
import { BimbinganService } from "src/bimbingan/bimbingan.service";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
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
      .where("mahasiswa.aktif = true")
      .andWhere("pendaftaranTesis.status = :status", {
        status: RegStatus.APPROVED,
      });

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
    const dosen = await this.penggunaRepository.findOne({
      where: { id: dosenId },
    });
    if (!dosen) {
      throw new BadRequestException("Dosen tidak ditemukan");
    }

    const statistics = await this.pendaftaranTesisRepository
      .createQueryBuilder("pendaftaranTesis")
      .select("pendaftaranTesis.jalurPilihan", "jalurPilihan")
      .addSelect("COUNT(*)", "count")
      .leftJoin("pendaftaranTesis.mahasiswa", "mahasiswa")
      .innerJoin(
        "pendaftaranTesis.dosenBimbingan",
        "dosenBimbingan",
        "dosenBimbingan.idDosen = :dosenId",
        {
          dosenId,
        },
      )
      .where("mahasiswa.aktif = true")
      .andWhere("pendaftaranTesis.status = :status", {
        status: RegStatus.APPROVED,
      })
      .groupBy("pendaftaranTesis.jalurPilihan")
      .getRawMany();

    return statistics as JalurStatisticDto[];
  }
}
