import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";
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
        waktuPengiriman: new Date(),
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
}
