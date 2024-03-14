import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";
import { ArrayContains, Like, Repository } from "typeorm";
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

  async findAllCreatedByPembimbing(options: {
    page: number;
    limit?: number;
    search?: string;
    idPembimbing?: string;
  }) {
    const dataQuery = this.topikRepo.find({
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
          id: options.idPembimbing || undefined,
          roles: ArrayContains([RoleEnum.S2_PEMBIMBING]),
        },
        judul: Like(`%${options.search || ""}%`),
      },
      relations: {
        pengaju: true,
      },
      order: {
        pengaju: {
          nama: "ASC",
        },
        judul: "ASC",
      },
      take: options.limit || undefined,
      skip: options.limit ? (options.page - 1) * options.limit : 0,
    });

    if (options.limit) {
      let countQuery = this.topikRepo
        .createQueryBuilder("topik")
        .select("topik.id")
        .innerJoinAndSelect("topik.pengaju", "pengaju")
        .where("pengaju.roles @> :role", {
          role: [RoleEnum.S2_PEMBIMBING],
        });

      if (options.idPembimbing) {
        countQuery = countQuery.andWhere("pengaju.id = :id", {
          id: options.idPembimbing || undefined,
        });
      }

      const [count, data] = await Promise.all([
        countQuery
          .andWhere("topik.judul LIKE :search", {
            search: `%${options.search || ""}%`,
          })
          .getCount(),
        dataQuery,
      ]);

      return {
        maxPage: Math.floor(count / options.limit),
        data,
      };
    } else {
      const data = await dataQuery;
      return {
        maxPage: data.length ? 1 : 0,
        data,
      };
    }
  }

  async update(id: string, updateDto: UpdateTopikDto) {
    return await this.topikRepo.update(id, updateDto);
  }

  async remove(id: string) {
    return await this.topikRepo.delete({ id }); // TODO: manage relation cascading option
  }
}
