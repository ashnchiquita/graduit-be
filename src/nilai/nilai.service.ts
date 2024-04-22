import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";
import { MataKuliah } from "src/entities/mataKuliah.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { Brackets, In, Repository } from "typeorm";
import { GetNilaiByMatkulRespDto, UpdateNilaiRespDto } from "./nilai.dto";

@Injectable()
export class NilaiService {
  constructor(
    @InjectRepository(MahasiswaKelas)
    private mhsKelasRepo: Repository<MahasiswaKelas>,
    @InjectRepository(Kelas)
    private kelasRepo: Repository<Kelas>,
    @InjectRepository(MataKuliah)
    private mataKuliahRepo: Repository<MataKuliah>,
    private konfServ: KonfigurasiService,
  ) {}

  private async isMhsKelasOrFail(mhsKelasIds: string[]) {
    const periode = await this.konfServ.getPeriodeOrFail();

    const mhsKelas = await this.mhsKelasRepo.find({
      select: { id: true },
      where: { id: In(mhsKelasIds), kelas: { periode } },
    });

    for (const mhsKelasId of mhsKelasIds) {
      if (!mhsKelas.find((mk) => mk.id === mhsKelasId)) {
        throw new Error(`Mahasiswa kelas ${mhsKelasId} tidak ditemukan`);
      }
    }
  }

  async getNilaiByMatkul(
    mataKuliahKode: string,
    page: number,
    limit: number,
    search: string,
  ) {
    const currPeriode = await this.konfServ.getPeriodeOrFail();

    const baseQuery = this.mataKuliahRepo
      .createQueryBuilder("matkul")
      .select([
        "matkul.kode AS mata_kuliah_kode",
        "matkul.nama AS mata_kuliah_nama",
        "kelas.nomor AS kelas_nomor",
        "mhsKelas.id AS mahasiswa_kelas_id",
        "mahasiswa.id AS mahasiswa_id",
        "mahasiswa.nama AS mahasiswa_nama",
        "mahasiswa.nim AS mahasiswa_nim",
        "mhsKelas.nilaiAkhir AS nilai_akhir",
      ])
      .innerJoin("matkul.kelas", "kelas")
      .leftJoin("kelas.mahasiswa", "mhsKelas")
      .innerJoin("mhsKelas.mahasiswa", "mahasiswa")
      .where("kelas.periode = :periode", { periode: currPeriode })
      .andWhere(
        new Brackets((qb) => {
          qb.where("mahasiswa.nama ILIKE :search", {
            search: `%${search}%`,
          }).orWhere("mahasiswa.nim ILIKE :search", { search: `%${search}%` });
        }),
      );

    if (mataKuliahKode) {
      baseQuery.andWhere("matkul.kode = :kode", { kode: mataKuliahKode });
    }

    const mhsKelas: GetNilaiByMatkulRespDto[] = await baseQuery
      .orderBy("matkul.kode")
      .addOrderBy("kelas.nomor")
      .addOrderBy("mahasiswa.nim")
      .skip((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return mhsKelas;
  }

  async updateNilai(
    mhsKelasIds: string[],
    nilaiAkhir?: number,
  ): Promise<UpdateNilaiRespDto> {
    await this.isMhsKelasOrFail(mhsKelasIds);

    await this.mhsKelasRepo.update(
      { id: In(mhsKelasIds) },
      { nilaiAkhir: nilaiAkhir ?? null },
    );

    return { mahasiswaKelasIds: mhsKelasIds };
  }
}
