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
  UpdateStatusDto,
  UpdateStatusResDto,
} from "./bimbingan.dto";
import { BerkasBimbingan } from "src/entities/berkasBimbingan";

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
    @InjectRepository(BerkasBimbingan)
    private berkasBimbinganRepository: Repository<BerkasBimbingan>,
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
      relations: {
        berkas: true,
      },
    });

    return {
      bimbingan,
      mahasiswa: {
        id: pendaftaran.mahasiswa.id,
        nama: pendaftaran.mahasiswa.nama,
        email: pendaftaran.mahasiswa.email,
        jalurPilihan: pendaftaran.jalurPilihan,
      },
      topik: pendaftaran.topik,
    };
  }

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

    const berkasBimbingan = createDto.berkas.map((berkas) =>
      this.berkasBimbinganRepository.create(berkas),
    );

    const createdBimbinganLog = this.bimbinganRepository.create({
      waktuBimbingan: createDto.waktuBimbingan,
      laporanKemajuan: createDto.laporanKemajuan,
      todo: createDto.todo,
      bimbinganBerikutnya: createDto.bimbinganBerikutnya,
      berkas: berkasBimbingan,
      pendaftaran,
    });

    await this.bimbinganRepository.save(createdBimbinganLog);

    return { id: createdBimbinganLog.id };
  }

  async updateStatus(
    user: AuthDto,
    dto: UpdateStatusDto,
  ): Promise<UpdateStatusResDto> {
    const currentPeriode = await this.konfigurasiRepository.findOne({
      where: { key: process.env.KONF_PERIODE_KEY },
    });

    const bimbinganQuery = this.bimbinganRepository
      .createQueryBuilder("bimbingan")
      .leftJoinAndSelect("bimbingan.pendaftaran", "pendaftaran")
      .leftJoinAndSelect("pendaftaran.dosenBimbingan", "dosenBimbingan")
      .leftJoinAndSelect("dosenBimbingan.dosen", "dosen")
      .leftJoin("pendaftaran.topik", "topik", "topik.periode = :periode", {
        periode: currentPeriode.value,
      })
      .leftJoinAndSelect("pendaftaran.mahasiswa", "mahasiswa")
      .where("bimbingan.id = :id", { id: dto.bimbinganId });
    const bimbingan = await bimbinganQuery.getOne();

    if (!bimbingan) {
      throw new NotFoundException("Bimbingan tidak ditemukan");
    }

    if (
      !user.roles.includes(RoleEnum.ADMIN) &&
      !bimbingan.pendaftaran.dosenBimbingan
        .map((d) => d.dosen.id)
        .includes(user.id)
    ) {
      throw new ForbiddenException();
    }

    await this.bimbinganRepository.update(bimbingan.id, {
      disahkan: dto.status,
    });

    return {
      id: bimbingan.id,
    };
  }
}
