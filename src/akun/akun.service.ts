import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Pengguna } from "src/entities/pengguna.entity";
import { Repository } from "typeorm";

@Injectable()
export class AkunService {
  constructor(
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
  ) {}

  async findAll(page: number, limit: number, search: string) {
    return await this.penggunaRepository
      .createQueryBuilder("pengguna")
      .where("pengguna.nama ILIKE :search", { search: `%${search}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
}
