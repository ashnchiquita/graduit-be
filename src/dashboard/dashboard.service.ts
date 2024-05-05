import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BimbinganService } from "src/bimbingan/bimbingan.service";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import {
  PendaftaranSidsem,
  SidsemStatus,
  TipeSidsemEnum,
} from "src/entities/pendaftaranSidsem";
import { ArrayContains, Brackets, In, Like, Repository } from "typeorm";
import {
  PendaftaranTesis,
  RegStatus,
} from "../entities/pendaftaranTesis.entity";
import { Pengguna, RoleEnum } from "../entities/pengguna.entity";
import {
  DashboardDto,
  DashboardTimTesisStatusEnum,
  GetDashboardTimTesisReqQueryDto,
  GetDashboardTimTesisRespDto,
  JalurStatisticDto,
} from "./dashboard.dto";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(DosenBimbingan)
    private dosenBimbinganRepository: Repository<DosenBimbingan>,
    @InjectRepository(PendaftaranSidsem)
    private pendaftaranSidsemRepository: Repository<PendaftaranSidsem>,
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

  async getDashboardTimTesis(
    query: GetDashboardTimTesisReqQueryDto,
  ): Promise<GetDashboardTimTesisRespDto> {
    const [foundMahasiswa, total] = await this.penggunaRepository.findAndCount({
      select: {
        id: true,
        nama: true,
        nim: true,
      },
      take: query.limit || undefined,
      skip: (query.page - 1) * query.limit || undefined,
      where: [
        {
          nim: Like(`%${query.search ?? ""}%`),
          roles: ArrayContains([RoleEnum.S2_MAHASISWA]),
        },
        {
          nama: Like(`%${query.search ?? ""}%`),
          roles: ArrayContains([RoleEnum.S2_MAHASISWA]),
        },
      ],
      order: {
        nim: "ASC",
      },
    });

    const dosbimQuery = this.dosenBimbinganRepository.find({
      select: {
        pendaftaran: {
          id: true,
          mahasiswaId: true,
        },
        dosen: {
          id: true,
          nama: true,
        },
      },
      relations: {
        pendaftaran: true,
        dosen: true,
      },
      where: {
        pendaftaran: {
          mahasiswaId: In(foundMahasiswa.map(({ id }) => id)),
        },
      },
    });

    const topicAcceptedQuery = this.pendaftaranTesisRepository.find({
      select: {
        id: true,
        mahasiswaId: true,
      },
      where: {
        status: RegStatus.APPROVED,
        mahasiswaId: In(foundMahasiswa.map(({ id }) => id)),
      },
    });

    const mhsSemProAcceptedQuery = this.pendaftaranSidsemRepository.find({
      select: {
        pendaftaranTesis: {
          mahasiswaId: true,
        },
      },
      relations: {
        pendaftaranTesis: true,
      },
      where: {
        tipe: TipeSidsemEnum.SEMINAR_1,
        status: SidsemStatus.APPROVED,
        pendaftaranTesis: {
          mahasiswaId: In(foundMahasiswa.map(({ id }) => id)),
        },
      },
    });

    const mhsSemTesAcceptedQuery = this.pendaftaranSidsemRepository.find({
      select: {
        pendaftaranTesis: {
          mahasiswaId: true,
        },
      },
      relations: {
        pendaftaranTesis: true,
      },
      where: {
        tipe: TipeSidsemEnum.SEMINAR_2,
        status: SidsemStatus.APPROVED,
        pendaftaranTesis: {
          mahasiswaId: In(foundMahasiswa.map(({ id }) => id)),
        },
      },
    });

    const mhsSidangAcceptedQuery = this.pendaftaranSidsemRepository.find({
      select: {
        pendaftaranTesis: {
          mahasiswaId: true,
        },
      },
      relations: {
        pendaftaranTesis: true,
      },
      where: {
        tipe: TipeSidsemEnum.SIDANG,
        status: SidsemStatus.APPROVED,
        pendaftaranTesis: {
          mahasiswaId: In(foundMahasiswa.map(({ id }) => id)),
        },
      },
    });

    const [
      foundDosbim,
      topicAccepted,
      mhsSemProAccepted,
      mhsSemTesAccepted,
      mhsSidangAccepted,
    ] = await Promise.all([
      dosbimQuery,
      topicAcceptedQuery,
      mhsSemProAcceptedQuery,
      mhsSemTesAcceptedQuery,
      mhsSidangAcceptedQuery,
    ]);

    const mhsStatusMap: Record<string, DashboardTimTesisStatusEnum[]> = {};
    const dosbimMap: Record<string, string[]> = {};

    foundMahasiswa.forEach(({ id }) => {
      mhsStatusMap[id] = [];
      dosbimMap[id] = [];
    });

    foundDosbim.forEach(({ pendaftaran: { mahasiswaId }, dosen: { nama } }) => {
      dosbimMap[mahasiswaId].push(nama);
    });

    topicAccepted.forEach(({ mahasiswaId }) => {
      mhsStatusMap[mahasiswaId].push(
        DashboardTimTesisStatusEnum.PENGAJUAN_TOPIK,
      );
    });

    mhsSemProAccepted.forEach(({ pendaftaranTesis: { mahasiswaId } }) => {
      mhsStatusMap[mahasiswaId].push(DashboardTimTesisStatusEnum.SEMINAR_1);
    });

    mhsSemTesAccepted.forEach(({ pendaftaranTesis: { mahasiswaId } }) => {
      mhsStatusMap[mahasiswaId].push(DashboardTimTesisStatusEnum.SEMINAR_2);
    });

    mhsSidangAccepted.forEach(({ pendaftaranTesis: { mahasiswaId } }) => {
      mhsStatusMap[mahasiswaId].push(DashboardTimTesisStatusEnum.SEMINAR_2);
    });

    return {
      maxPage: !!query.limit ? Math.ceil(total / query.limit) : 1,
      data: foundMahasiswa.map(({ nim, id, nama }) => ({
        nim_mahasiswa: nim,
        nama_mahasiswa: nama,
        status: mhsStatusMap[id] ?? [],
        dosen_pembimbing: dosbimMap[id] ?? [],
      })),
    };
  }
}
