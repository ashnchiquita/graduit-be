import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";
import { ArrayContains, Repository } from "typeorm";
import { CreateTopikDto, UpdateTopikDto } from "./alokasi-topik.dto";

@Injectable()
export class AlokasiTopikService {
  constructor(@InjectRepository(Topik) private topikRepo: Repository<Topik>) {}

  async create(createDto: CreateTopikDto) {
    return await this.topikRepo.insert(createDto);
  }

  async findById(id: string) {
    return await this.topikRepo.findOne({
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        pengaju: {
          id: true,
          nama: true,
          email: true,
          roles: true,
        },
      },
      where: {
        id,
      },
      relations: {
        pengaju: true,
      },
    });
  }

  async findByPengajuId(idPengaju: string) {
    return await this.topikRepo.find({
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        pengaju: {
          id: true,
          nama: true,
          email: true,
          roles: true,
        },
      },
      where: {
        pengaju: {
          id: idPengaju,
        },
      },
      relations: {
        pengaju: true,
      },
    });
  }

  async findAllCreatedByPembimbing() {
    return await this.topikRepo.find({
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        pengaju: {
          id: true,
          nama: true,
          email: true,
          roles: true,
        },
      },
      where: {
        pengaju: {
          roles: ArrayContains([RoleEnum.S2_PEMBIMBING]),
        },
      },
      relations: {
        pengaju: true,
      },
    });
  }

  async update(id: string, updateDto: UpdateTopikDto) {
    const topik = await this.topikRepo.findOne({
      select: { id: true },
      where: { id },
    });

    if (topik) return await this.topikRepo.save({ id, ...updateDto });
    throw new NotFoundException();
  }

  async remove(id: string) {
    return await this.topikRepo.delete({ id }); // TODO: manage relation cascading option
  }
}
