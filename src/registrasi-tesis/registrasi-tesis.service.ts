import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as dayjs from "dayjs";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";
import { generateQueryBuilderOrderByObj } from "src/helper/sorting";
import { ArrayContains, Brackets, DataSource, In, Repository } from "typeorm";
import {
  FindAllNewestRegRespDto,
  IdDto,
  RegDto,
  RegStatisticsRespDto,
  UpdateInterviewBodyDto,
  UpdatePembimbingBodyDto,
  UpdateStatusBodyDto,
} from "./registrasi-tesis.dto";

@Injectable()
export class RegistrasiTesisService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(Topik)
    private topicRepostitory: Repository<Topik>,
    @InjectRepository(DosenBimbingan)
    private dosenBimbinganRepository: Repository<DosenBimbingan>,
    private dataSource: DataSource,
  ) {}

  async createTopicRegistration(
    userId: string,
    topicRegistrationDto: RegDto,
    periode: string,
  ): Promise<IdDto> {
    const queries: (
      | Promise<void | PendaftaranTesis>
      | Promise<Pengguna>
      | Promise<Topik>
    )[] = [
      this.getNewestRegByMhsOrFail(userId, periode).catch(
        (ex: BadRequestException) => {
          if (ex.message === "No mahasiswa user with given id exists") {
            throw ex;
          }
          // else: mahasiswa does not have pending registration -> allowed
        },
      ),
      this.penggunaRepository.findOne({
        where: { id: topicRegistrationDto.idPenerima },
      }),
    ];

    if (topicRegistrationDto.idTopik) {
      queries.push(
        this.topicRepostitory.findOne({
          where: { id: topicRegistrationDto.idTopik },
        }),
      );
    }

    const queryResult = await Promise.all(queries);
    const lastPendaftaran = queryResult[0] as PendaftaranTesis;
    const penerima = queryResult[1] as Pengguna;
    let topik = topicRegistrationDto.idTopik ? (queryResult[2] as Topik) : null;

    if (!penerima) {
      throw new NotFoundException("Penerima not found.");
    }

    if (topicRegistrationDto.idTopik && !topik) {
      throw new NotFoundException("Topic not found.");
    }

    if (lastPendaftaran && lastPendaftaran.status !== RegStatus.REJECTED) {
      throw new BadRequestException(
        "Mahasiswa already has pending registration in this period",
      );
    }

    if (!topik) {
      if (
        !topicRegistrationDto.judulTopik ||
        !topicRegistrationDto.deskripsiTopik
      ) {
        throw new BadRequestException(
          "Judul dan deskripsi topik tidak boleh kosong.",
        );
      }

      topik = this.topicRepostitory.create({
        judul: topicRegistrationDto.judulTopik,
        deskripsi: topicRegistrationDto.deskripsiTopik,
        idPengaju: userId,
        periode,
      });
    }

    // Create new registration
    const createdRegistration = this.pendaftaranTesisRepository.create({
      ...topicRegistrationDto,
      mahasiswaId: userId,
      penerima,
      topik,
    });

    await this.pendaftaranTesisRepository.save(createdRegistration);

    return {
      id: createdRegistration.id,
    };
  }

  async findByUserId(
    mahasiswaId: string,
    periode: string,
    isNewestOnly: boolean,
    idPenerima?: string,
  ) {
    const baseQuery = this.pendaftaranTesisRepository
      .createQueryBuilder("pt")
      .select("pt.id")
      .addSelect("pt.jadwalInterview")
      .addSelect("pt.status")
      .addSelect("pt.jalurPilihan")
      .addSelect("pt.waktuPengiriman")
      .addSelect("topik.judul")
      .addSelect("penerima.id")
      .addSelect("penerima.nama")
      .addSelect("penerima.kontak")
      .addSelect("dosenBimbingan")
      .addSelect("dosen.id")
      .addSelect("dosen.nama")
      .addSelect("dosen.kontak")
      .addSelect("topik.judul")
      .addSelect("topik.deskripsi")
      .leftJoin("pt.topik", "topik")
      .leftJoin("pt.penerima", "penerima")
      .leftJoin("pt.dosenBimbingan", "dosenBimbingan")
      .leftJoin("dosenBimbingan.dosen", "dosen")
      .where("pt.mahasiswaId = :mahasiswaId", { mahasiswaId })
      .andWhere("topik.periode = :periode", { periode })
      .orderBy("pt.waktuPengiriman", "DESC");

    const res = await baseQuery.getMany();

    if (res.length === 0) {
      throw new NotFoundException("Tidak ada registrasi tesis yang ditemukan.");
    }

    if (idPenerima) {
      // requester only has S2_PEMBIMBING access
      const reg = res[0];

      if (reg.penerima.id !== idPenerima) {
        throw new ForbiddenException();
      }
    }

    const mappedRes = res.map((r) => ({
      id: r.id,
      jadwalInterview: r.jadwalInterview,
      jalurPilihan: r.jalurPilihan,
      status: r.status,
      waktuPengiriman: r.waktuPengiriman,
      judulTopik: r.topik.judul,
      deskripsiTopik: r.topik.deskripsi,
      dosenPembimbing:
        r.status === RegStatus.APPROVED
          ? r.dosenBimbingan.map((db) => db.dosen)
          : [r.penerima],
    }));

    if (isNewestOnly) {
      // only get last registration
      // slow performance because get all records first then only returns the first one
      // need to change to use subquery
      mappedRes.splice(1);
    }

    return mappedRes;
  }

  async getRegsStatistics(options: {
    periode: string;
    idPenerima?: string;
  }): Promise<RegStatisticsRespDto> {
    let totalMahasiswa = this.penggunaRepository.count({
      where: { roles: ArrayContains([RoleEnum.S2_MAHASISWA]) },
    });

    // Show newest regs per Mhs
    const baseQuery = this.pendaftaranTesisRepository
      .createQueryBuilder("pt")
      .innerJoinAndSelect(
        (qb) =>
          qb
            .select([
              "pt.mahasiswaId AS latest_mahasiswaId",
              "MAX(pt.waktuPengiriman) AS latestPengiriman",
            ])
            .from(PendaftaranTesis, "pt")
            .groupBy("pt.mahasiswaId"),
        "latest",
        "latest.latest_mahasiswaId = pt.mahasiswaId AND pt.waktuPengiriman = latest.latestPengiriman",
      )
      .innerJoinAndSelect("pt.topik", "topik")
      .where("topik.periode = :periode", { periode: options.periode });

    if (options.idPenerima) {
      baseQuery.andWhere("pt.penerimaId = :idPenerima", {
        idPenerima: options.idPenerima,
      });

      totalMahasiswa = baseQuery.getCount();
    }

    const totalDiterima = baseQuery
      .clone()
      .andWhere("pt.status = :status", { status: RegStatus.APPROVED })
      .getCount();

    const totalProses = baseQuery
      .clone()
      .andWhere("pt.status IN (:...status)", {
        status: [RegStatus.NOT_ASSIGNED, RegStatus.INTERVIEW],
      })
      .getCount();

    const totalDitolak = baseQuery
      .clone()
      .andWhere("pt.status = :status", { status: RegStatus.REJECTED })
      .getCount();

    const [total, diterima, proses, ditolak] = await Promise.all([
      totalMahasiswa,
      totalDiterima,
      totalProses,
      totalDitolak,
    ]);

    return {
      diterima: {
        amount: diterima,
        percentage: Math.round((diterima / total) * 100),
      },
      sedang_proses: {
        amount: proses,
        percentage: Math.round((proses / total) * 100),
      },
      ditolak: {
        amount: ditolak,
        percentage: Math.round((ditolak / total) * 100),
      },
    };
  }

  async findAllRegs(options: {
    status?: RegStatus;
    page: number;
    limit?: number;
    idPenerima?: string;
    search?: string;
    order_by?: "nim";
    sort?: "ASC" | "DESC";
    periode: string;
  }) {
    const baseQuery = this.pendaftaranTesisRepository
      .createQueryBuilder("pt")
      .select("pt");

    // Show newest regs per Mhs
    // May need to make materialized view to improve performance
    baseQuery.innerJoinAndSelect(
      (qb) =>
        qb
          .select([
            "pt.mahasiswaId AS latest_mahasiswaId",
            "MAX(pt.waktuPengiriman) AS latestPengiriman",
          ])
          .from(PendaftaranTesis, "pt")
          .groupBy("pt.mahasiswaId"),
      "latest",
      "latest.latest_mahasiswaId = pt.mahasiswaId AND pt.waktuPengiriman = latest.latestPengiriman",
    );

    baseQuery
      .innerJoinAndSelect("pt.topik", "topik")
      .innerJoinAndSelect("pt.penerima", "penerima")
      .innerJoinAndSelect("pt.mahasiswa", "mahasiswa")
      .where("topik.periode = :periode", { periode: options.periode });

    if (options.idPenerima) {
      baseQuery.andWhere("pt.penerimaId = :idPenerima", {
        idPenerima: options.idPenerima,
      });
    }

    if (options.search)
      baseQuery.andWhere(
        new Brackets((qb) =>
          qb
            .where("mahasiswa.nama ILIKE :search", {
              search: `%${options.search}%`,
            })
            .orWhere("mahasiswa.nim ILIKE :search", {
              search: `%${options.search}%`,
            }),
        ),
      );

    if (options.status)
      baseQuery.andWhere("pt.status = :status", {
        status: options.status,
      });

    if (options.order_by) {
      const orderByMapping = {
        nim: "CAST(mahasiswa.nim AS INTEGER)",
      };

      baseQuery.orderBy(
        generateQueryBuilderOrderByObj(
          orderByMapping,
          options.order_by,
          options.sort,
        ),
      );
    }

    if (options.limit) {
      baseQuery.take(options.limit);
      baseQuery.skip((options.page - 1) * options.limit);
    }

    const [data, count] = await baseQuery.getManyAndCount();

    const resData: FindAllNewestRegRespDto = {
      data: data.map((reg) => ({
        pendaftaran_id: reg.id,
        nim: reg.mahasiswa.nim,
        mahasiswa_id: reg.mahasiswa.id,
        mahasiswa_nama: reg.mahasiswa.nama,
        pembimbing_nama: reg.penerima.nama,
        status: reg.status,
        jadwal_interview: reg.jadwalInterview,
      })),
      count,
    };

    return resData;
  }

  private async getNewestRegByMhsOrFail(mahasiswaId: string, periode: string) {
    const mahasiswa = await this.penggunaRepository.findOne({
      select: {
        id: true,
        roles: true,
      },
      where: {
        id: mahasiswaId,
      },
    });

    if (!mahasiswa || !mahasiswa.roles.includes(RoleEnum.S2_MAHASISWA))
      throw new BadRequestException("No mahasiswa user with given id exists");

    const newestReg = await this.pendaftaranTesisRepository.findOne({
      select: {
        id: true,
        jadwalInterview: true,
        status: true,
        waktuPengiriman: true,
        jalurPilihan: true,
        topik: {
          judul: true,
          deskripsi: true,
          periode: true,
        },
        penerima: {
          id: true,
        },
      },
      relations: {
        topik: true,
        penerima: true,
        mahasiswa: true,
      },
      where: {
        mahasiswa: mahasiswa,
        topik: {
          periode,
        },
      },
      order: {
        waktuPengiriman: "DESC",
      },
    });

    if (!newestReg)
      throw new BadRequestException(
        "Mahasiswa does not have pending registration in this period",
      );

    return newestReg;
  }

  async updateInterviewDate(
    mahasiswaId: string,
    periode: string,
    dto: UpdateInterviewBodyDto,
    idPenerima?: string,
  ) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);

    if (dayjs(dto.date).isBefore(dayjs(minDate).endOf("d"))) {
      throw new BadRequestException(
        "Interview date must be at least 2 days from now",
      );
    }

    const newestReg = await this.getNewestRegByMhsOrFail(mahasiswaId, periode);

    if (newestReg && idPenerima && newestReg.penerima.id !== idPenerima) {
      throw new ForbiddenException();
    }

    const restrictedStatus: RegStatus[] = [
      RegStatus.APPROVED,
      RegStatus.REJECTED,
    ];

    if (restrictedStatus.includes(newestReg.status))
      throw new BadRequestException(
        newestReg.status == RegStatus.APPROVED
          ? "Cannot set interview for registration that is already accepted"
          : "Mahasiswa does not have pending registration",
      );

    const newDate = new Date(dto.date);

    await this.pendaftaranTesisRepository.update(
      { id: newestReg.id },
      { jadwalInterview: newDate, status: RegStatus.INTERVIEW },
    );

    return { id: newestReg.id } as IdDto;
  }

  async updateStatus(
    mahasiswaId: string,
    periode: string,
    dto: UpdateStatusBodyDto,
    idPenerima?: string,
  ) {
    const newestReg = await this.getNewestRegByMhsOrFail(mahasiswaId, periode);

    if (newestReg && idPenerima && newestReg.penerima.id !== idPenerima) {
      throw new ForbiddenException();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        PendaftaranTesis,
        { id: newestReg.id },
        { status: dto.status, waktuKeputusan: new Date() },
      );

      if (dto.status === RegStatus.APPROVED) {
        await queryRunner.manager.insert(DosenBimbingan, {
          idPendaftaran: newestReg.id,
          idDosen: newestReg.penerima.id,
        });
      } else {
        // dto.status === RegStatus.REJECTED
        await queryRunner.manager.delete(DosenBimbingan, {
          idPendaftaran: newestReg.id,
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return { id: newestReg.id } as IdDto;
  }

  async updatePembimbingList(
    mahasiswaId: string,
    periode: string,
    { pembimbing_ids: dosen_ids }: UpdatePembimbingBodyDto,
  ) {
    const newestReg = await this.getNewestRegByMhsOrFail(mahasiswaId, periode);

    if (newestReg.status !== RegStatus.APPROVED)
      throw new BadRequestException(
        "Cannot update pembimbing on non-approved registration",
      );

    const newPembimbingList = await this.penggunaRepository.findBy({
      id: In(dosen_ids),
    });

    if (
      newPembimbingList.length !== dosen_ids.length ||
      newPembimbingList.some(
        (dosen) => !dosen.roles.includes(RoleEnum.S2_PEMBIMBING),
      )
    )
      throw new BadRequestException("Dosen id list contains invalid user ids");

    const currentPembimbing = await this.dosenBimbinganRepository.findBy({
      idPendaftaran: newestReg.id,
    });

    const newPembimbingIds = newPembimbingList.map((dosen) => dosen.id);
    const currentPembimbingIds = currentPembimbing.map(
      (currentPembimbing) => currentPembimbing.idDosen,
    );

    const idsToBeAdded = newPembimbingIds.filter(
      (newId) => !currentPembimbingIds.includes(newId),
    );

    const idsToBeDeleted = currentPembimbingIds.filter(
      (newId) => !newPembimbingIds.includes(newId),
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.insert(
        DosenBimbingan,
        idsToBeAdded.map((idDosen) => ({ pendaftaran: newestReg, idDosen })),
      );
      await queryRunner.manager.delete(DosenBimbingan, {
        idDosen: In(idsToBeDeleted),
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return { id: newestReg.id } as IdDto;
  }
}
