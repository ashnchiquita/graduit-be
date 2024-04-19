import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";
import { ArrayContains, Repository } from "typeorm";

@Injectable()
export class DosenBimbinganService {
  constructor(
    @InjectRepository(Pengguna)
    private penggunaRepo: Repository<Pengguna>,
  ) {}

  async getAll() {
    return await this.penggunaRepo.find({
      select: {
        id: true,
        nama: true,
        email: true,
      },
      where: {
        roles: ArrayContains([RoleEnum.S2_PEMBIMBING]),
      },
    });
  }
}
