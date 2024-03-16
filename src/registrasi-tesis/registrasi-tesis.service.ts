import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like } from "typeorm";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { Repository } from "typeorm";
import { RegistrasiTopikDto } from "./registrasi-tesis.dto";
import { Pengguna } from "src/entities/pengguna.entity";
import { validateId } from "src/helper/validation";
import { Topik } from "src/entities/topik.entity";

@Injectable()
export class RegistrasiTesisService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(Topik)
    private topicRepostitory: Repository<Topik>,
  ) {}

  async createTopicRegistration(
    userId: string,
    topicRegistrationDto: RegistrasiTopikDto,
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
    return await this.pendaftaranTesisRepository.find({
      relations: ["topik", "penerima"],
      where: { mahasiswa: { id: mahasiswaId } },
    });
  }

  async findAllReg(options: {
    status?: RegStatus;
    page: number;
    limit?: number;
    idPenerima?: string;
    search?: string;
    sort?: "ASC" | "DESC";
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
      },
      where: {
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
        .innerJoinAndSelect("pendaftaranTesis.penerima", "penerima")
        .innerJoinAndSelect("pendaftaranTesis.mahasiswa", "mahasiswa")
        .where("mahasiswa.nama LIKE :search", {
          search: `%${options.search || ""}%`,
        });

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
}
