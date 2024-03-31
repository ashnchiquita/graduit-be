import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as dayjs from "dayjs";
import { AuthDto } from "src/auth/auth.dto";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Repository } from "typeorm";
import {
  CreateBimbinganReqDto,
  CreateBimbinganResDto,
  GetByMahasiswaIdResDto,
} from "./bimbingan.dto";

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
      where: { key: process.env.KONF_PERIODE_KEY },
    });

    const pendaftaran = await this.pendaftaranTesisRepository.findOne({
      where: {
        mahasiswa: { id: mahasiswaId },
        status: RegStatus.APPROVED,
        topik: {
          periode: currentPeriode.value,
        },
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
    // only validate if user isn't high authority
    // and user is not mhs checking their own logs
    if (
      !user.roles.includes(RoleEnum.ADMIN) &&
      !user.roles.includes(RoleEnum.S2_TIM_TESIS) &&
      !(user.roles.includes(RoleEnum.S2_MAHASISWA) && mahasiswaId == user.id)
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

  // TODO handle file upload
  async create(
    mahasiswaId: string,
    createDto: CreateBimbinganReqDto,
  ): Promise<CreateBimbinganResDto> {
    // Check if user registered in bimbingan
    const currentPeriode = await this.konfigurasiRepository.findOne({
      where: { key: process.env.KONF_PERIODE_KEY },
    });

    const pendaftaran = await this.pendaftaranTesisRepository.findOne({
      where: {
        mahasiswa: { id: mahasiswaId },
        status: RegStatus.APPROVED,
        topik: {
          periode: currentPeriode.value,
        },
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

    console.log(dayjs(createDto.waktuBimbingan).toDate());

    if (dayjs(createDto.waktuBimbingan).isAfter(dayjs(new Date()).endOf("d")))
      throw new BadRequestException(
        "Tanggal bimbingan yang dimasukkan tidak boleh melebihi tanggal hari ini",
      );

    if (
      dayjs(createDto.bimbinganBerikutnya)
        .endOf("D")
        .isBefore(dayjs(createDto.waktuBimbingan).startOf("D"))
    )
      throw new BadRequestException(
        "Bimbingan berikutnya harus setelah bimbingan yang dimasukkan",
      );

    const createdBimbinganLog = this.bimbinganRepository.create({
      ...createDto,
      berkasLinks: [],
      pendaftaran,
    });

    await this.bimbinganRepository.save(createdBimbinganLog);

    return { message: "Successfully added log" };
  }
}
