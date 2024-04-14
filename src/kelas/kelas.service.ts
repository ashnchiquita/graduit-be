import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { Brackets, Repository } from "typeorm";
import {
  AssignKelasDto,
  CreateKelasDto,
  GetListKelasRespDto,
  MessageResDto,
  UnassignKelasDto,
} from "./kelas.dto";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { MataKuliah } from "src/entities/mataKuliah";
import { Pengguna } from "src/entities/pengguna.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas";
import { PengajarKelas } from "src/entities/pengajarKelas.entity";

@Injectable()
export class KelasService {
  constructor(
    @InjectRepository(Kelas)
    private kelasRepo: Repository<Kelas>,
    @InjectRepository(MataKuliah)
    private mataKuliahRepo: Repository<MataKuliah>,
    private konfService: KonfigurasiService,
    @InjectRepository(Pengguna)
    private penggunaRepo: Repository<Pengguna>,
    @InjectRepository(MahasiswaKelas)
    private mahasiswaKelasRepo: Repository<MahasiswaKelas>,
    @InjectRepository(PengajarKelas)
    private pengajarKelasRepo: Repository<PengajarKelas>,
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

  async getKelasPengguna(mode: "MAHASISWA" | "DOSEN", search?: string) {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    const relation = mode === "MAHASISWA" ? "mahasiswaKelas" : "pengajarKelas";

    let penggunaQuery = this.penggunaRepo
      .createQueryBuilder("pengguna")
      .select(["pengguna.id", "pengguna.nama", "pengguna.email"])
      .leftJoinAndSelect(`pengguna.${relation}`, relation)
      .leftJoinAndSelect(
        `${relation}.kelas`,
        "kelas",
        "kelas.periode = :periode",
        {
          periode: currPeriod,
        },
      )
      .where("pengguna.roles @> :role", {
        role: [mode === "MAHASISWA" ? "S2_MAHASISWA" : "S2_KULIAH"],
      });

    if (search) {
      penggunaQuery = penggunaQuery.andWhere(
        new Brackets((qb) => {
          qb.where("pengguna.nama ILIKE :search", { search: `%${search}%` });
          qb.orWhere("pengguna.email ILIKE :search", { search: `%${search}%` });
        }),
      );
    }

    const mhs = await penggunaQuery.getMany();
    console.log(mhs);
    return mhs.map((m) => ({
      ...m,
      kelas: m?.[relation].map((k) => ({
        id: k.kelas.id,
        nomor: k.kelas.nomor,
        mata_kuliah: k.kelas.mataKuliahKode,
      })),
    }));
  }

  async assignKelasMahasiswa(dto: AssignKelasDto): Promise<MessageResDto> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    for (const mhsId of dto.penggunaIds) {
      const currKelasQuery = this.mahasiswaKelasRepo
        .createQueryBuilder("mahasiswaKelas")
        .leftJoinAndSelect("mahasiswaKelas.kelas", "kelas")
        .where("mahasiswaKelas.mahasiswaId = :mhsId", { mhsId })
        .andWhere("kelas.periode = :periode", { periode: currPeriod });

      const currKelas = (await currKelasQuery.getMany()).map((k) => k.kelasId);

      for (const kelasId of dto.kelasIds) {
        if (currKelas.includes(kelasId)) {
          continue;
        }

        await this.mahasiswaKelasRepo.insert({
          mahasiswaId: mhsId,
          kelasId,
        });
      }
    }

    return { message: "Kelas berhasil diassign" };
  }

  async unassignKelasMahasiswa(dto: UnassignKelasDto): Promise<MessageResDto> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    for (const mhsId of dto.penggunaIds) {
      const currKelasQuery = this.mahasiswaKelasRepo
        .createQueryBuilder("mahasiswaKelas")
        .leftJoinAndSelect("mahasiswaKelas.kelas", "kelas")
        .where("mahasiswaKelas.mahasiswaId = :mhsId", { mhsId })
        .andWhere("kelas.periode = :periode", { periode: currPeriod });

      const currKelas = (await currKelasQuery.getMany()).map((k) => k.kelasId);

      for (const kelasId of currKelas) {
        await this.mahasiswaKelasRepo.delete({
          mahasiswaId: mhsId,
          kelasId,
        });
      }
    }

    return { message: "Kelas berhasil dihapus" };
  }

  async assignKelasDosen(dto: AssignKelasDto): Promise<MessageResDto> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    for (const dosenId of dto.penggunaIds) {
      const currKelasQuery = this.pengajarKelasRepo
        .createQueryBuilder("pengajarKelas")
        .leftJoinAndSelect("pengajarKelas.kelas", "kelas")
        .where("pengajarKelas.pengajarId = :dosenId", { dosenId })
        .andWhere("kelas.periode = :periode", { periode: currPeriod });

      const currKelas = (await currKelasQuery.getMany()).map((k) => k.kelasId);

      for (const kelasId of dto.kelasIds) {
        if (currKelas.includes(kelasId)) {
          continue;
        }

        await this.pengajarKelasRepo.insert({
          pengajarId: dosenId,
          kelasId,
        });
      }
    }

    return { message: "Kelas berhasil diassign" };
  }

  async unassignKelasDosen(dto: UnassignKelasDto): Promise<MessageResDto> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    for (const dosenId of dto.penggunaIds) {
      const currKelasQuery = this.pengajarKelasRepo
        .createQueryBuilder("pengajarKelas")
        .leftJoinAndSelect("pengajarKelas.kelas", "kelas")
        .where("pengajarKelas.pengajarId = :dosenId", { dosenId })
        .andWhere("kelas.periode = :periode", { periode: currPeriod });

      const currKelas = (await currKelasQuery.getMany()).map((k) => k.kelasId);

      for (const kelasId of currKelas) {
        await this.pengajarKelasRepo.delete({
          pengajarId: dosenId,
          kelasId,
        });
      }
    }

    return { message: "Kelas berhasil dihapus" };
  }
}
