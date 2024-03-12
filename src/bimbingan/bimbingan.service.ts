import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { Repository } from "typeorm";
import { GetByMahasiswaIdResDto } from "./bimbingan.dto";
import { AuthDto } from "src/auth/auth.dto";
import {
  PengajuanPengambilanTopik,
  RegStatus,
} from "src/entities/pengajuanPengambilanTopik.entity";
import { RoleEnum } from "src/entities/pengguna.entity";

@Injectable()
export class BimbinganService {
  constructor(
    @InjectRepository(Bimbingan)
    private bimbinganRepository: Repository<Bimbingan>,
    @InjectRepository(PengajuanPengambilanTopik)
    private pengajuanPengambilanTopikRepository: Repository<PengajuanPengambilanTopik>,
  ) {}

  async getByMahasiswaId(
    mahasiswaId: string,
    user: AuthDto,
  ): Promise<GetByMahasiswaIdResDto> {
    // TODO: match with current periode

    // Validate bimbingan data by its dosbim
    if (
      !user.roles.includes(RoleEnum.ADMIN) &&
      !user.roles.includes(RoleEnum.S2_TIM_TESIS)
    ) {
      // TODO: handle for multiple dosbim
      const pengajuan = await this.pengajuanPengambilanTopikRepository.findOne({
        where: { mahasiswa: { id: mahasiswaId }, status: RegStatus.APPROVED },
        relations: ["pembimbing"],
      });
      if (pengajuan.pembimbing.id !== user.id) {
        throw new ForbiddenException();
      }
    }

    const [bimbingan, pengajuan] = await Promise.all([
      this.bimbinganRepository.find({
        where: { mahasiswa: { id: mahasiswaId } },
        relations: ["topik"],
      }),
      // TODO: possibly needs a schema change to add unique constraint for findOne
      this.pengajuanPengambilanTopikRepository.find({
        select: {
          mahasiswa: {
            id: true,
            nama: true,
            email: true,
          },
          jalurPilihan: true,
        },
        relations: ["mahasiswa"],
        where: { mahasiswa: { id: mahasiswaId } },
      }),
    ]);

    return {
      bimbingan,
      mahasiswa: {
        ...pengajuan[0].mahasiswa,
        jalurPilihan: pengajuan[0].jalurPilihan,
      },
    };
  }
}
