import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";
import { RegistrasiTopikDto } from "src/dto/registrasi-topik";
import { Pengguna } from "src/entities/pengguna.entity";
import { validateId } from "src/helper/validation";

@Injectable()
export class RegistrasiTesisService {
  constructor(
    @InjectRepository(PengajuanPengambilanTopik)
    private pengajuanPengambilanTopikRepository: Repository<PengajuanPengambilanTopik>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
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

    // Validate user id
    const user = await this.penggunaRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    // Validate supervisor id
    const supervisor = await this.penggunaRepository.findOne({
      where: { id: topicRegistrationDto.idPembimbing },
    });

    if (!supervisor) {
      throw new NotFoundException("Supervisor not found.");
    }

    // Create new registration
    const createdRegistration = this.pengajuanPengambilanTopikRepository.create(
      {
        ...topicRegistrationDto,
        mahasiswa: user,
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
