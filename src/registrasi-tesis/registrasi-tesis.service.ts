import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";
import { generateQueryBuilderOrderByObj } from "src/helper/sorting";
import { validateId } from "src/helper/validation";
import { ArrayContains, In, Repository } from "typeorm";
import {
  FindAllNewestRegRespDto,
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
  ) {}

  async createTopicRegistration(
    userId: string,
    topicRegistrationDto: RegDto,
  ): Promise<PendaftaranTesis> {
    // TODO: Proper validations

    // Validate id
    validateId([
      { id: userId, object: "Pengguna" },
      { id: topicRegistrationDto.idPenerima, object: "Pembimbing" },
    ]);

    // Validate user id, supervisor id
    const [user, supervisor, topic] = await Promise.all([
      this.penggunaRepository.findOne({
        where: { id: userId },
      }),
      this.penggunaRepository.findOne({
        where: { id: topicRegistrationDto.idPenerima },
      }),
      this.topicRepostitory.findOne({
        where: { judul: topicRegistrationDto.judulTopik },
      }),
    ]);

    if (!user) {
      throw new NotFoundException("User not found.");
    } else if (!supervisor) {
      throw new NotFoundException("Supervisor not found.");
    } else if (!topic) {
      throw new NotFoundException("Topic not found.");
    }

    // Create new registration
    const createdRegistration = this.pendaftaranTesisRepository.create({
      ...topicRegistrationDto,
      mahasiswa: user,
      penerima: supervisor,
      topik: topic,
    });

    await this.pendaftaranTesisRepository.save(createdRegistration);

    return createdRegistration;
  }

  async findByUserId(mahasiswaId: string) {
    const res = await this.pendaftaranTesisRepository.find({
      relations: ["topik", "penerima"],
      where: { mahasiswa: { id: mahasiswaId } },
    });

    return res.map((r) => ({
      ...r,
      penerima: {
        ...r.penerima,
        password: undefined,
        roles: undefined,
        nim: undefined,
      },
    }));
  }

  async getRegsStatistics(options: {
    periode: string;
    idPenerima?: string;
  }): Promise<RegStatisticsRespDto> {
    const totalMahasiswa = this.penggunaRepository.count({
      where: { roles: ArrayContains([RoleEnum.S2_MAHASISWA]) },
    });

    // Show newest regs per Mhs if POV TimTesis or Admin
    if (!options.idPenerima) {
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

      const totalDiterima = baseQuery
        .clone()
        .andWhere("pt.status = :status", { status: RegStatus.APPROVED })
        .getCount();

      const totalProses = baseQuery
        .clone()
        .where("pt.status IN (:...status)", {
          status: [RegStatus.NOT_ASSIGNED, RegStatus.INTERVIEW],
        })
        .getCount();

      const totalDitolak = baseQuery
        .clone()
        .where("pt.status = :status", { status: RegStatus.REJECTED })
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
    } else {
      throw new InternalServerErrorException("Not implemented");
    }
  }

  // TODO sort
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

    // Show newest regs per Mhs if POV TimTesis or Admin
    // May need to make materialized view to improve performance
    if (!options.idPenerima) {
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
    }

    baseQuery
      .innerJoinAndSelect("pt.topik", "topik")
      .innerJoinAndSelect("pt.penerima", "penerima")
      .innerJoinAndSelect("pt.mahasiswa", "mahasiswa")
      .where("topik.periode = :periode", { periode: options.periode });

    if (options.search)
      baseQuery.andWhere(
        "mahasiswa.nama LIKE '%' || :search || '%' OR mahasiswa.nim LIKE '%' || :search || '%'",
        {
          search: options.search,
        },
      );

    if (options.idPenerima)
      baseQuery.andWhere("penerima.id = :idPenerima", {
        idPenerima: options.idPenerima,
      });

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
      })),
      count,
    };

    return resData;
  }

  async findRegById(id: string) {
    // not periode-protected
    return await this.pendaftaranTesisRepository.findOne({
      select: {
        id: true,
        waktuPengiriman: true,
        jadwalInterview: true,
        waktuKeputusan: true,
        status: true,
        jalurPilihan: true,
        penerima: {
          id: true,
          nama: true,
          email: true,
        },
        mahasiswa: {
          id: true,
          nama: true,
          email: true,
          nim: true,
        },
      },
      where: {
        id,
      },
      relations: {
        penerima: true,
        topik: true,
        mahasiswa: true,
      },
    });
  }

  async getNewestRegByMhs(mahasiswaId: string, periode: string) {
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
        status: true,
        waktuPengiriman: true,
        topik: {
          periode: true,
        },
      },
      relations: {
        topik: true,
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
  ) {
    const newestReg = await this.getNewestRegByMhs(mahasiswaId, periode);

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

    return { status: "ok" };
  }

  async updateStatus(
    mahasiswaId: string,
    periode: string,
    dto: UpdateStatusBodyDto,
  ) {
    const newestReg = await this.getNewestRegByMhs(mahasiswaId, periode);

    await this.pendaftaranTesisRepository.update(
      { id: newestReg.id },
      { status: dto.status },
    );

    return { status: "ok" };
  }

  async updatePembimbingList(
    mahasiswaId: string,
    periode: string,
    { pembimbing_ids: dosen_ids }: UpdatePembimbingBodyDto,
  ) {
    const newestReg = await this.getNewestRegByMhs(mahasiswaId, periode);

    // TODO decide to allow unapproved Registrations to have their Penerima changed or not
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

    await Promise.all([
      this.dosenBimbinganRepository.insert(
        idsToBeAdded.map((idDosen) => ({ pendaftaran: newestReg, idDosen })),
      ),
      this.dosenBimbinganRepository.delete({ idDosen: In(idsToBeDeleted) }),
    ]);

    return { status: "ok" };
  }
}
