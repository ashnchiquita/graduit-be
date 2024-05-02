import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";
import { ArrayContains, Repository } from "typeorm";

@Injectable()
export class PenggunaService {
  constructor(
    @InjectRepository(Pengguna)
    private penggunaRepo: Repository<Pengguna>,
  ) {}

  async isMahasiswaAktifOrFail(id: string) {
    const mhs = await this.penggunaRepo.findOneBy({
      id,
      aktif: true,
      roles: ArrayContains([RoleEnum.S2_MAHASISWA]),
    });

    if (!mhs) {
      throw new NotFoundException("Mahasiswa aktif tidak ditemukan");
    }
  }
}
