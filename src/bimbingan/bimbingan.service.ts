import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { Repository } from "typeorm";
import { GetByMahasiswaIdResDto } from "./bimbingan.dto";
import { AuthDto } from "src/auth/auth.dto";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";

@Injectable()
export class BimbinganService {
  constructor(
    @InjectRepository(Bimbingan)
    private bimbinganRepository: Repository<Bimbingan>,
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Konfigurasi)
    private konfigurasiRepository: Repository<Konfigurasi>,
    @InjectRepository(DosenBimbingan)
    private dosenBimbinganRepository: Repository<DosenBimbingan>,
  ) {}

  async getByMahasiswaId(
    mahasiswaId: string,
    user: AuthDto,
  ): Promise<GetByMahasiswaIdResDto> {
    const currentPeriode = await this.konfigurasiRepository.findOne({
      where: { key: "PERIODE" },
    });

    const pendaftaran = await this.pendaftaranTesisRepository.findOne({
      where: {
        mahasiswa: { id: mahasiswaId },
        status: RegStatus.APPROVED,
        periode: currentPeriode.value,
      },
      relations: {
        mahasiswa: true,
        topik: true,
        penerima: true,
      },
    });

    if (!pendaftaran) {
      throw new NotFoundException(
        "Tidak ada pendaftaran yang disetujui pada periode ini",
      );
    }

    // Validate bimbingan data by its dosbim
    if (
      !user.roles.includes(RoleEnum.ADMIN) &&
      !user.roles.includes(RoleEnum.S2_TIM_TESIS)
    ) {
      const dosbim = await this.dosenBimbinganRepository.find({
        where: { pendaftaran: { id: pendaftaran.id } },
        relations: { dosen: true },
      });

      if (!dosbim.map((d) => d.dosen.id).includes(user.id)) {
        throw new ForbiddenException();
      }
    }

    const bimbingan = await this.bimbinganRepository.find({
      where: {
        pendaftaran: {
          id: pendaftaran.id,
        },
      },
    });

    return {
      bimbingan,
      mahasiswa: {
        ...pendaftaran.mahasiswa,
        password: undefined,
        roles: undefined,
        jalurPilihan: pendaftaran.jalurPilihan,
      },
      topik: pendaftaran.topik,
    };
  }
}
