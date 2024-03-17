import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { ArrayContains, DataSource, Repository } from "typeorm";

@Injectable()
export class DosenBimbinganService {
  constructor(
    @InjectRepository(DosenBimbingan)
    private dosbimRepo: Repository<DosenBimbingan>,
    @InjectRepository(Pengguna)
    private penggunaRepo: Repository<Pengguna>,
    @InjectRepository(PendaftaranTesis)
    private pendaftaranRepo: Repository<PendaftaranTesis>,
    private konfService: KonfigurasiService,
    private dataSource: DataSource,
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

  async findByRegId(regId: string) {
    return await this.dosbimRepo.find({
      select: {
        id: true,
        dosen: {
          id: true,
          nama: true,
          email: true,
        },
      },
      relations: {
        dosen: true,
      },
      where: {
        pendaftaran: {
          id: regId,
        },
      },
    });
  }

  async updateByRegId(regId: string, dosbimIds: string[]) {
    const [reg, currPeriod] = await Promise.all([
      this.pendaftaranRepo.findOne({
        select: { id: true, status: true },
        where: { id: regId },
        relations: { topik: true },
      }),
      this.konfService.getKonfigurasiByKey(process.env.KONF_PERIODE_KEY),
    ]);

    if (!reg || reg.status !== RegStatus.APPROVED) {
      throw new BadRequestException(
        "Registrasi tidak ditemukan atau tidak disetujui.",
      );
    }

    if (!currPeriod || currPeriod !== reg.topik.periode) {
      throw new BadRequestException(
        "Periode belum dikonfigurasi atau tidak sesuai dengan periode sekarang.",
      );
    }

    for (const dosbimId of dosbimIds) {
      const res = await this.penggunaRepo.findOne({
        select: {
          id: true,
        },
        where: {
          id: dosbimId,
          roles: ArrayContains([RoleEnum.S2_PEMBIMBING]),
        },
      });

      if (!res) {
        throw new BadRequestException("Invalid pembimbing id");
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.removeByRegId(regId);

      for (const dosbimId of dosbimIds) {
        await queryRunner.manager.getRepository(DosenBimbingan).insert({
          idPendaftaran: regId,
          idDosen: dosbimId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async removeByRegId(regId: string) {
    return await this.dosbimRepo
      .createQueryBuilder()
      .delete()
      .where("idPendaftaran = :idPendaftaran", {
        idPendaftaran: regId,
      })
      .execute();
  }
}
