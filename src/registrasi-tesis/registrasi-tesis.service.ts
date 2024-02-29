import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";
import { Repository } from "typeorm";

@Injectable()
export class RegistrasiTesisService {
  constructor(
    @InjectRepository(PengajuanPengambilanTopik)
    private pengajuanPengambilanTopikRepository: Repository<PengajuanPengambilanTopik>,
  ) {}

  async findByUserId(mahasiswaId: string) {
    return await this.pengajuanPengambilanTopikRepository
      .createQueryBuilder("pengajuanPengambilanTopik")
      .where("pengajuanPengambilanTopik.mahasiswa = :mahasiswaId", {
        mahasiswaId,
      })
      .getMany();
  }
}
