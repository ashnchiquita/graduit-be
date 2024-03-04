import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ModuleRef } from "@nestjs/core";
import { getEntityManagerToken } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";
import { RegistrasiTopikDto } from "src/dto/registrasi-topik";
import { Pengguna } from "src/entities/pengguna.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";

@Injectable()
export class RegistrasiTesisService {
  constructor(
    @InjectRepository(PengajuanPengambilanTopik)
    private pengajuanPengambilanTopikRepository: Repository<PengajuanPengambilanTopik>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(DosenBimbingan)
    private dosenBimbinganRepository: Repository<DosenBimbingan>,
    private readonly moduleRef: ModuleRef,
  ) {
    try {
      const connection: EntityManager = this.moduleRef.get(
        getEntityManagerToken(""),
        {
          strict: false,
        },
      );

      connection;
    } catch (error: any) {
      // Handle request scope
    }
  }

  async createTopicRegistration(
    userId: string,
    topicRegistrationDto: RegistrasiTopikDto,
  ): Promise<PengajuanPengambilanTopik> {
    // TODO: Proper validations

    // Validate user id
    const user = await this.penggunaRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    // Validate supervisor id
    const supervisor = await this.dosenBimbinganRepository.findOne({
      where: { dosen: topicRegistrationDto.idPembimbing },
    });

    if (!supervisor) {
      throw new NotFoundException("Supervisor not found.");
    }

    // Create new registration
    const createdRegistration = this.pengajuanPengambilanTopikRepository.create(
      {
        ...topicRegistrationDto,
        idMahasiswa: userId,
      },
    );

    await this.pengajuanPengambilanTopikRepository.save(createdRegistration);

    return createdRegistration;
  }

  async findByUserId(mahasiswaId: string) {
    return await this.pengajuanPengambilanTopikRepository
      .createQueryBuilder("pengajuanPengambilanTopik")
      .where("pengajuanPengambilanTopik.mahasiswa = :mahasiswaId", {
        mahasiswaId,
      })
      .getMany();
  }
}
