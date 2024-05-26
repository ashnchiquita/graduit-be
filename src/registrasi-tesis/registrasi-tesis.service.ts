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
import { PenggunaService } from "src/pengguna/pengguna.service";
import { HttpService } from "@nestjs/axios";
import { Request } from "express";
import { firstValueFrom } from "rxjs";

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
    private penggunaService: PenggunaService,
    private httpService: HttpService,
  ) {}

  async createTopicRegistration(
    userId: string,
    topicRegistrationDto: RegDto,
  ): Promise<IdDto> {
    const queries: (
      | Promise<void | PendaftaranTesis>
      | Promise<Pengguna>
      | Promise<Topik>
    )[] = [
      this.getNewestRegByMhsOrFail(userId).catch((ex: BadRequestException) => {
        if (ex.message === "No mahasiswa user with given id exists") {
          throw ex;
        }
        // else: mahasiswa does not have pending registration -> allowed
      }),
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

    if (topicRegistrationDto.idTopik) {
      if (!topik) {
        throw new NotFoundException("Topic not found.");
      }

      if (!topik.aktif) {
        throw new BadRequestException("Topic is not active.");
      }
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
    isNewestOnly: boolean,
    idPenerima?: string,
  ) {
    await this.penggunaService.isMahasiswaAktifOrFail(mahasiswaId);

    const baseQuery = this.pendaftaranTesisRepository
      .createQueryBuilder("pt")
      .select([
        "pt.id",
        "pt.jadwalInterview",
        "pt.status",
        "pt.jalurPilihan",
        "pt.waktuPengiriman",
        "topik.judul",
        "topik.deskripsi",
        "penerima.id",
        "penerima.nama",
        "penerima.kontakWhatsApp",
        "penerima.kontakMsTeams",
        "penerima.kontakEmail",
        "penerima.kontakTelp",
        "penerima.kontakLainnya",
        "dosenBimbingan",
        "dosen.id",
        "dosen.nama",
        "dosen.kontakWhatsApp",
        "dosen.kontakMsTeams",
        "dosen.kontakEmail",
        "dosen.kontakTelp",
        "dosen.kontakLainnya",
      ])
      .leftJoin("pt.topik", "topik")
      .leftJoin("pt.penerima", "penerima")
      .leftJoin("pt.dosenBimbingan", "dosenBimbingan")
      .leftJoin("dosenBimbingan.dosen", "dosen")
      .where("pt.mahasiswaId = :mahasiswaId", { mahasiswaId })
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
      .innerJoin("pt.mahasiswa", "mahasiswa")
      .where("mahasiswa.aktif = true");

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
      .innerJoinAndSelect("pt.penerima", "penerima")
      .innerJoinAndSelect("pt.mahasiswa", "mahasiswa")
      .where("mahasiswa.aktif = true");

    if (options.idPenerima) {
      baseQuery.andWhere("pt.penerimaId = :idPenerima", {
        idPenerima: options.idPenerima,
      });
    }

    if (options.search) {
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
    }

    if (options.status) {
      baseQuery.andWhere("pt.status = :status", { status: options.status });
    }

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

  async getNewestRegByMhsOrFail(mahasiswaId: string) {
    const mahasiswa = await this.penggunaRepository.findOne({
      select: {
        id: true,
        roles: true,
      },
      where: {
        id: mahasiswaId,
        aktif: true,
      },
    });

    if (!mahasiswa || !mahasiswa.roles.includes(RoleEnum.S2_MAHASISWA))
      throw new BadRequestException(
        "No active mahasiswa user with given id exists",
      );

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
    dto: UpdateInterviewBodyDto,
    req: Request,
    idPenerima?: string,
  ) {
    await this.penggunaService.isMahasiswaAktifOrFail(mahasiswaId);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);

    if (dayjs(dto.date).isBefore(dayjs(minDate).endOf("d"))) {
      throw new BadRequestException(
        "Interview date must be at least 2 days from now",
      );
    }

    const newestReg = await this.getNewestRegByMhsOrFail(mahasiswaId);

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

    let token = "";
    if (req?.cookies?.[process.env.COOKIE_NAME]) {
      token = req.cookies[process.env.COOKIE_NAME];
    }
    if (req.headers?.authorization) {
      token = req.headers.authorization.slice(7);
    }

    const { data: notif } = await firstValueFrom(
      this.httpService.post(
        `${process.env.AUTH_SERVICE_URL}/notifikasi`,
        {
          title: "Jadwal interview pendaftaran Anda telah diubah",
          description:
            "Jadwal interview pendaftaran tesis Anda telah diubah. Silahkan periksa kembali data Anda untuk mengetahui lebih lanjut.",
          penggunaId: mahasiswaId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

    try {
      await this.pendaftaranTesisRepository.update(
        { id: newestReg.id },
        { jadwalInterview: newDate, status: RegStatus.INTERVIEW },
      );
    } catch {
      await firstValueFrom(
        this.httpService.delete(
          `${process.env.AUTH_SERVICE_URL}/notifikasi/${notif.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
    }

    return { id: newestReg.id } as IdDto;
  }

  async updateStatus(
    mahasiswaId: string,
    dto: UpdateStatusBodyDto,
    req: Request,
    idPenerima?: string,
  ) {
    await this.penggunaService.isMahasiswaAktifOrFail(mahasiswaId);

    const newestReg = await this.getNewestRegByMhsOrFail(mahasiswaId);

    if (newestReg && idPenerima && newestReg.penerima.id !== idPenerima) {
      throw new ForbiddenException();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let token = "";
    if (req?.cookies?.[process.env.COOKIE_NAME]) {
      token = req.cookies[process.env.COOKIE_NAME];
    }
    if (req.headers?.authorization) {
      token = req.headers.authorization.slice(7);
    }

    const { data: notif } = await firstValueFrom(
      this.httpService.post(
        `${process.env.AUTH_SERVICE_URL}/notifikasi`,
        {
          title: `Pendaftaran tesis Anda ${dto.status === RegStatus.APPROVED ? "diterima" : "ditolak"}`,
          description: `Pendaftaran tesis Anda ${dto.status === RegStatus.APPROVED ? "diterima" : "ditolak"}. Silahkan periksa kembali data Anda untuk mengetahui lebih lanjut.`,
          penggunaId: mahasiswaId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

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

      await firstValueFrom(
        this.httpService.delete(
          `${process.env.AUTH_SERVICE_URL}/notifikasi/${notif.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return { id: newestReg.id } as IdDto;
  }

  async updatePembimbingList(
    mahasiswaId: string,
    { pembimbing_ids: dosen_ids }: UpdatePembimbingBodyDto,
    req: Request,
  ) {
    await this.penggunaService.isMahasiswaAktifOrFail(mahasiswaId);

    const newestReg = await this.getNewestRegByMhsOrFail(mahasiswaId);

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

    let token = "";
    if (req?.cookies?.[process.env.COOKIE_NAME]) {
      token = req.cookies[process.env.COOKIE_NAME];
    }
    if (req.headers?.authorization) {
      token = req.headers.authorization.slice(7);
    }

    const { data: notif } = await firstValueFrom(
      this.httpService.post(
        `${process.env.AUTH_SERVICE_URL}/notifikasi`,
        {
          title: "Dosen pembimbing Anda telah diubah",
          description:
            "Dosen pembimbing Anda telah diubah. Silahkan periksa kembali data Anda untuk mengetahui lebih lanjut.",
          penggunaId: mahasiswaId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

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

      await firstValueFrom(
        this.httpService.delete(
          `${process.env.AUTH_SERVICE_URL}/notifikasi/${notif.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return { id: newestReg.id } as IdDto;
  }
}
