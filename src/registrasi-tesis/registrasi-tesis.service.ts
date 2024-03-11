import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like } from "typeorm";
import {
  PengajuanPengambilanTopik,
  RegStatus,
} from "src/entities/pengajuanPengambilanTopik.entity";
import { Repository } from "typeorm";
import { RegistrasiTopikDto } from "./registrasi-tesis.dto";
import { Pengguna } from "src/entities/pengguna.entity";
import { validateId } from "src/helper/validation";
import { Topik } from "src/entities/topik.entity";

@Injectable()
export class RegistrasiTesisService {
  constructor(
    @InjectRepository(PengajuanPengambilanTopik)
    private pengajuanPengambilanTopikRepository: Repository<PengajuanPengambilanTopik>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(Topik)
    private topicRepostitory: Repository<Topik>,
  ) {}

  async createTopicRegistration(
    userId: string,
    topicRegistrationDto: RegistrasiTopikDto,
  ): Promise<PengajuanPengambilanTopik> {
    // TODO: Proper validations

    // Validate id
    validateId([
      { id: userId, object: "Pengguna" },
      { id: topicRegistrationDto.idPembimbing, object: "Pembimbing" },
    ]);

    // Validate user id, supervisor id
    const [user, supervisor, topic] = await Promise.all([
      this.penggunaRepository.findOne({
        where: { id: userId },
      }),
      this.penggunaRepository.findOne({
        where: { id: topicRegistrationDto.idPembimbing },
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
    const createdRegistration = this.pengajuanPengambilanTopikRepository.create(
      {
        ...topicRegistrationDto,
        mahasiswa: user,
        pembimbing: supervisor,
        topik: topic,
      },
    );

    await this.pengajuanPengambilanTopikRepository.save(createdRegistration);

    return createdRegistration;
  }

  async findByUserId(mahasiswaId: string) {
    return await this.pengajuanPengambilanTopikRepository.find({
      relations: ["topik", "pembimbing"],
      where: { mahasiswa: { id: mahasiswaId } },
    });
  }

  async findAllReg(options: {
    status?: RegStatus;
    page: number;
    limit?: number;
    idPembimbing?: string;
    search?: string;
    sort?: "ASC" | "DESC";
  }) {
    return await this.pengajuanPengambilanTopikRepository.find({
      select: {
        id: true,
        waktuPengiriman: true,
        jadwalInterview: true,
        waktuKeputusan: true,
        jalurPilihan: true,
        status: true,
        pembimbing: {
          id: true,
          nama: true,
          email: true,
        },
        mahasiswa: {
          id: true,
          nama: true,
          email: true,
        },
      },
      relations: {
        mahasiswa: true,
        pembimbing: true,
      },
      where: {
        status: options.status || undefined,
        pembimbing: {
          id: options.idPembimbing || undefined,
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
  }

  async findRegById(id: string) {
    return await this.pengajuanPengambilanTopikRepository.findOne({
      select: {
        id: true,
        waktuPengiriman: true,
        jadwalInterview: true,
        waktuKeputusan: true,
        status: true,
        jalurPilihan: true,
        pembimbing: {
          id: true,
          nama: true,
          email: true,
        },
        mahasiswa: {
          id: true,
          nama: true,
          email: true,
        },
      },
      where: {
        id,
      },
      relations: {
        pembimbing: true,
        topik: true,
        mahasiswa: true,
      },
    });
  }
}
