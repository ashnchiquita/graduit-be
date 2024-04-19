import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { PendaftaranSidsem } from "src/entities/pendaftaranSidsem";
import { PengujiSidsem } from "src/entities/pengujiSidsem.entity";
import { Like, Repository } from "typeorm";
import {
  GetAllPengajuanSidangItemDto,
  GetAllPengajuanSidangReqQueryDto,
  GetAllPengajuanSidangRespDto,
  GetOnePengajuanSidangRespDto,
  UpdateAlokasiRuanganReqDto,
  UpdateAlokasiRuanganRespDto,
} from "./alokasi-ruangan.dto";

@Injectable()
export class AlokasiRuanganService {
  constructor(
    @InjectRepository(PendaftaranSidsem)
    private pendaftaranSidsemRepo: Repository<PendaftaranSidsem>,
    @InjectRepository(PengujiSidsem)
    private pengujiSidsemRepo: Repository<PengujiSidsem>,
    @InjectRepository(DosenBimbingan)
    private dosenBimbinganRepo: Repository<DosenBimbingan>,
  ) {}

  async findAll(
    query: GetAllPengajuanSidangReqQueryDto,
  ): Promise<GetAllPengajuanSidangRespDto> {
    const [queryData, total] = await this.pendaftaranSidsemRepo.findAndCount({
      select: {
        id: true,
        waktuMulai: true,
        tipe: true,
        ruangan: true,
        pendaftaranTesis: {
          mahasiswa: {
            nim: true,
            nama: true,
          },
        },
      },
      relations: {
        pendaftaranTesis: {
          mahasiswa: true,
        },
      },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      where: {
        tipe: query.jenisSidang,
        pendaftaranTesis: {
          mahasiswa: [
            { nim: Like(`%${query.search}%`) },
            { nama: Like(`%${query.search}%`) },
          ],
        },
      },
    });

    const data: GetAllPengajuanSidangItemDto[] = queryData.map((res) => ({
      idPengajuanSidsem: res.id,
      nimMahasiswa: res.pendaftaranTesis.mahasiswa.nim,
      namaMahasiswa: res.pendaftaranTesis.mahasiswa.nama,
      jadwalSidang: res.waktuMulai.toISOString(),
      jenisSidang: res.tipe,
      ruangan: res.ruangan,
    }));

    return { data, total };
  }

  async findOne(id: string): Promise<GetOnePengajuanSidangRespDto> {
    // TODO handle errors
    const sidsemQueryData = await this.pendaftaranSidsemRepo.findOne({
      select: {
        id: true,
        waktuMulai: true,
        tipe: true,
        ruangan: true,
        pendaftaranTesis: {
          id: true,
          mahasiswa: {
            nim: true,
            nama: true,
            email: true,
          },
          jalurPilihan: true,
          topik: {
            judul: true,
            deskripsi: true,
          },
        },
      },
      relations: {
        pendaftaranTesis: {
          mahasiswa: true,
          topik: true,
        },
      },
      where: {
        id,
      },
    });

    const pengujiQueryData = await this.pengujiSidsemRepo.find({
      select: {
        dosen: {
          nama: true,
        },
      },
      relations: {
        dosen: true,
      },
      where: {
        sidsem: {
          id,
        },
      },
    });

    const pembimbingQueryData = await this.dosenBimbinganRepo.find({
      select: {
        dosen: {
          nama: true,
        },
      },
      relations: {
        dosen: true,
      },
      where: {
        idPendaftaran: sidsemQueryData.pendaftaranTesis.id,
      },
    });

    const data: GetOnePengajuanSidangRespDto = {
      idPengajuanSidsem: sidsemQueryData.id,
      nimMahasiswa: sidsemQueryData.pendaftaranTesis.mahasiswa.nim,
      namaMahasiswa: sidsemQueryData.pendaftaranTesis.mahasiswa.nama,
      // TODO jadwal sidang pake column apa
      jadwalSidang: sidsemQueryData.waktuMulai.toISOString(),
      jenisSidang: sidsemQueryData.tipe,
      ruangan: sidsemQueryData.ruangan,
      emailMahasiswa: sidsemQueryData.pendaftaranTesis.mahasiswa.email,
      jalurPilihan: sidsemQueryData.pendaftaranTesis.jalurPilihan,
      judulTopik: sidsemQueryData.pendaftaranTesis.topik.judul,
      deskripsiTopik: sidsemQueryData.pendaftaranTesis.topik.deskripsi,
      dosenPembimbing: pembimbingQueryData.map(({ dosen: { nama } }) => nama),
      dosenPenguji: pengujiQueryData.map(({ dosen: { nama } }) => nama),
    };

    return data;
  }

  async update(
    id: string,
    updateAlokasiRuanganDto: UpdateAlokasiRuanganReqDto,
  ): Promise<UpdateAlokasiRuanganRespDto> {
    const pendaftaranSidsem = await this.pendaftaranSidsemRepo.findOne({
      select: {
        id: true,
        waktuMulai: true,
        tipe: true,
        pendaftaranTesis: {
          mahasiswa: {
            nama: true,
            nim: true,
          },
        },
      },
      relations: {
        pendaftaranTesis: {
          mahasiswa: true,
        },
      },
      where: {
        id,
      },
    });

    if (pendaftaranSidsem === null)
      throw new BadRequestException(
        "Pendaftaran sidang/seminar with diven id does not exist",
      );

    pendaftaranSidsem.ruangan = updateAlokasiRuanganDto.ruangan;
    await this.pendaftaranSidsemRepo.save(pendaftaranSidsem);

    return {
      idPengajuanSidsem: pendaftaranSidsem.id,
      jadwalSidang: pendaftaranSidsem.waktuMulai.toISOString(),
      jenisSidang: pendaftaranSidsem.tipe,
      namaMahasiswa: pendaftaranSidsem.pendaftaranTesis.mahasiswa.nama,
      nimMahasiswa: pendaftaranSidsem.pendaftaranTesis.mahasiswa.nim,
      ruangan: pendaftaranSidsem.ruangan,
    };
  }
}
