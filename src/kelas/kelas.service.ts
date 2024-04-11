import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { Repository } from "typeorm";
import { CreateKelasDto, GetListKelasRespDto } from "./kelas.dto";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { MataKuliah } from "src/entities/mataKuliah";

@Injectable()
export class KelasService {
  constructor(
    @InjectRepository(Kelas)
    private kelasRepo: Repository<Kelas>,
    @InjectRepository(MataKuliah)
    private mataKuliahRepo: Repository<MataKuliah>,
    private konfService: KonfigurasiService,
  ) {}

  async getListKelas(idMahasiswa?: string, idPengajar?: string) {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    let baseQuery = this.kelasRepo
      .createQueryBuilder("kelas")
      .leftJoinAndSelect("kelas.mahasiswa", "mahasiswa")
      .leftJoinAndSelect("kelas.mataKuliah", "mataKuliah")
      .select([
        "kelas.id AS id",
        "kelas.nomor AS nomor",
        "mataKuliah.kode AS kode_mata_kuliah",
        "mataKuliah.nama AS nama_mata_kuliah",
        "COUNT(mahasiswa) AS jumlah_mahasiswa",
      ])
      .orderBy("mataKuliah.kode", "ASC")
      .addOrderBy("kelas.nomor", "ASC")
      .where("kelas.periode = :periode", { periode: currPeriod });

    if (idMahasiswa) {
      baseQuery = baseQuery
        .innerJoin("kelas.mahasiswa", "mahasiswa_filter")
        .andWhere("mahasiswa_filter.mahasiswaId = :idMahasiswa", {
          idMahasiswa,
        });
    }

    if (idPengajar) {
      baseQuery = baseQuery
        .innerJoin("kelas.pengajar", "pengajar")
        .andWhere("pengajar.pengajarId = :idPengajar", {
          idPengajar,
        });
    }

    const result = await baseQuery
      .groupBy("kelas.id, mataKuliah.kode")
      .getRawMany();

    const mapped: GetListKelasRespDto[] = result.map((r) => ({
      id: r.id,
      nomor: "K" + `${r.nomor}`.padStart(2, "0"),
      mata_kuliah: `${r.kode_mata_kuliah} ${r.nama_mata_kuliah}`,
      jumlah_mahasiswa: parseInt(r.jumlah_mahasiswa),
    }));

    return mapped;
  }

  async create(createDto: CreateKelasDto) {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    const maxClass = await this.kelasRepo.findOne({
      where: {
        mataKuliahKode: createDto.mataKuliahKode,
        periode: currPeriod,
      },
      order: {
        nomor: "DESC",
      },
    });

    const num = maxClass ? maxClass.nomor + 1 : 1;

    return await this.kelasRepo.insert({
      ...createDto,
      nomor: num,
      periode: currPeriod,
      warna: "gray", // TODO: random color, maybe need some adjustment for tailwind dynamic binding
    });
  }

  async createMatkul(createDto: MataKuliah) {
    await this.mataKuliahRepo.insert(createDto);

    return { kode: createDto.kode };
  }
}
