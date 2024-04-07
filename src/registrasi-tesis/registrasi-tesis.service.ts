import {
  BadRequestException,
  Injectable,
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
import { validateId } from "src/helper/validation";
import { In, Like, Repository } from "typeorm";
import {
  RegDto,
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

  async findAllReg(options: {
    status?: RegStatus;
    page: number;
    limit?: number;
    idPenerima?: string;
    search?: string;
    sort?: "ASC" | "DESC";
    periode: string;
  }) {
    const dataQuery = this.pendaftaranTesisRepository.find({
      select: {
        id: true,
        waktuPengiriman: true,
        jadwalInterview: true,
        waktuKeputusan: true,
        jalurPilihan: true,
        status: true,
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
      relations: {
        mahasiswa: true,
        penerima: true,
        topik: true,
      },
      where: {
        topik: {
          periode: options.periode,
        },
        status: options.status || undefined,
        penerima: {
          id: options.idPenerima || undefined,
        },
        mahasiswa: {
          nama: Like(`%${options.search || ""}%`),
        },
      },
      order: {
        waktuPengiriman: options.sort || "ASC",
      },
      take: options.limit || undefined,
      skip: options.limit ? (options.page - 1) * options.limit : 0,
    });

    if (options.limit) {
      let countQuery = this.pendaftaranTesisRepository
        .createQueryBuilder("pendaftaranTesis")
        .select("pendaftaranTesis.id")
        .innerJoinAndSelect("pendaftaranTesis.topik", "topik")
        .innerJoinAndSelect("pendaftaranTesis.penerima", "penerima")
        .innerJoinAndSelect("pendaftaranTesis.mahasiswa", "mahasiswa")
        .where("topik.periode = :periode", { periode: options.periode });

      if (options.status) {
        countQuery = countQuery.andWhere("pendaftaranTesis.status = :status", {
          status: options.status,
        });
      }

      if (options.idPenerima) {
        countQuery = countQuery.andWhere("penerima.id = :idPenerima", {
          idPenerima: options.idPenerima,
        });
      }

      if (options.search) {
        countQuery = countQuery.andWhere("mahasiswa.nama LIKE :search", {
          search: `%${options.search || ""}%`,
        });
      }

      const [count, data] = await Promise.all([
        countQuery.getCount(),
        dataQuery,
      ]);

      return {
        data,
        maxPage: Math.ceil(count / options.limit),
      };
    } else {
      const data = await dataQuery;
      return {
        data,
        maxPage: data.length ? 1 : 0,
      };
    }
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

  async udpatePembimbingList(
    mahasiswaId: string,
    periode: string,
    { pembimbing_ids: dosen_ids }: UpdatePembimbingBodyDto,
  ) {
    const newestReg = await this.getNewestRegByMhs(mahasiswaId, periode);

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
