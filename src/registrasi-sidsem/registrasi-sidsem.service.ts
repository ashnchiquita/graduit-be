import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { PendaftaranSidsem } from "src/entities/pendaftaranSidsem";
import { PengujiSidsem } from "src/entities/pengujiSidsem.entity";
import { Brackets, Repository } from "typeorm";
import {
  GetAllPengajuanSidangItemDto,
  GetAllPengajuanSidangReqQueryDto,
  GetAllPengajuanSidangRespDto,
  GetOnePengajuanSidangRespDto,
  UpdateAlokasiRuanganReqDto,
  UpdateAlokasiRuanganRespDto,
} from "./registrasi-sidsem.dto";

@Injectable()
export class RegistrasiSidsemService {
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
    const baseQuery = this.pendaftaranSidsemRepo
      .createQueryBuilder("ps")
      .innerJoinAndSelect(
        (qb) =>
          qb
            .select([
              "ps.pendaftaranTesisId AS latest_pendaftaranTesisId",
              "ps.tipe AS latest_tipe",
              "MAX(ps.waktuPengiriman) AS latestPengiriman",
            ])
            .from(PendaftaranSidsem, "ps")
            .groupBy("ps.pendaftaranTesisId")
            .addGroupBy("ps.tipe"),
        "latest",
        "latest.latest_pendaftaranTesisId = ps.pendaftaranTesisId AND latest.latest_tipe = ps.tipe AND ps.waktuPengiriman = latest.latestPengiriman",
      )
      .innerJoinAndSelect("ps.pendaftaranTesis", "pt")
      .innerJoinAndSelect("pt.mahasiswa", "mahasiswa")
      .where("ps.status = 'APPROVED'");

    if (query.search) {
      baseQuery.andWhere(
        new Brackets((qb) =>
          qb
            .where("mahasiswa.nama ILIKE :search", {
              search: `%${query.search}%`,
            })
            .orWhere("mahasiswa.nim ILIKE :search", {
              search: `%${query.search}%`,
            }),
        ),
      );
    }

    if (query.jenisSidang) {
      baseQuery.andWhere("ps.jenisSidang = :jenisSidang", {
        jenisSidang: query.jenisSidang,
      });
    }

    if (query.limit) {
      baseQuery.take(query.limit);
      baseQuery.skip((query.page - 1) * query.limit);
    }

    const [queryData, total] = await baseQuery.getManyAndCount();

    const data: GetAllPengajuanSidangItemDto[] = queryData.map((res) => ({
      idPengajuanSidsem: res.id,
      nimMahasiswa: res.pendaftaranTesis.mahasiswa.nim,
      namaMahasiswa: res.pendaftaranTesis.mahasiswa.nama,
      jadwalSidang: !!res.jadwal ? res.jadwal.toISOString() : null,
      jenisSidang: res.tipe,
      ruangan: res.ruangan,
    }));

    return { data, total };
  }

  async findOne(id: string): Promise<GetOnePengajuanSidangRespDto> {
    const sidsemQueryData = await this.pendaftaranSidsemRepo.findOne({
      select: {
        id: true,
        jadwal: true,
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

    if (sidsemQueryData === null)
      throw new BadRequestException(
        "Pendaftaran sidang with given id does not exist",
      );

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
      jadwalSidang: sidsemQueryData.jadwal.toISOString(),
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
        jadwal: true,
        tipe: true,
        pendaftaranTesis: {
          id: true,
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

    pendaftaranSidsem.ruangan =
      updateAlokasiRuanganDto.ruangan === ""
        ? null
        : updateAlokasiRuanganDto.ruangan;
    await this.pendaftaranSidsemRepo.save(pendaftaranSidsem);

    return {
      idPengajuanSidsem: pendaftaranSidsem.id,
      jadwalSidang: pendaftaranSidsem.jadwal.toISOString(),
      jenisSidang: pendaftaranSidsem.tipe,
      namaMahasiswa: pendaftaranSidsem.pendaftaranTesis.mahasiswa.nama,
      nimMahasiswa: pendaftaranSidsem.pendaftaranTesis.mahasiswa.nim,
      ruangan: pendaftaranSidsem.ruangan,
    };
  }
}
