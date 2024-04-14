import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Pengguna } from "src/entities/pengguna.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas";
import { PengajarKelas } from "src/entities/pengajarKelas.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { Brackets, Repository, DataSource } from "typeorm";
import {
  CreateKelasDto,
  DeleteKelasDto,
  GetListKelasRespDto,
  IdKelasResDto,
  UpdateKelasDto,
  AssignKelasDto,
  MessageResDto,
  UnassignKelasDto,
} from "./kelas.dto";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { MataKuliah } from "src/entities/mataKuliah";
import { CARD_COLORS } from "./kelas.constant";

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
    private datasource: DataSource,
  ) {}

  async getListKelas(
    idMahasiswa?: string,
    idPengajar?: string,
    kodeMatkul?: string,
    search?: string,
  ) {
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

    if (kodeMatkul) {
      baseQuery = baseQuery.andWhere("mataKuliah.kode = :kodeMatkul", {
        kodeMatkul,
      });
    }

    if (search) {
      baseQuery = baseQuery.andWhere(
        new Brackets((qb) => {
          qb.where("mataKuliah.kode ILIKE :search", {
            search: `%${search}%`,
          }).orWhere("mataKuliah.nama ILIKE :search", {
            search: `%${search}%`,
          });
        }),
      );
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

  async create(createDto: CreateKelasDto): Promise<IdKelasResDto> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    let nomor = createDto.nomor;
    if (nomor) {
      const checkClassQueary = this.kelasRepo
        .createQueryBuilder("kelas")
        .where("kelas.nomor = :nomor", { nomor })
        .andWhere("kelas.mataKuliahKode = :mataKuliahKode", {
          mataKuliahKode: createDto.mataKuliahKode,
        })
        .andWhere("kelas.periode = :periode", { periode: currPeriod });

      const checkClass = await checkClassQueary.getOne();

      if (checkClass) {
        throw new BadRequestException(`Kelas dengan nomor ${nomor} sudah ada`);
      }
    } else {
      nomor = await this.getNextNomorKelas(createDto.mataKuliahKode);
    }

    const colorIdx = Math.floor(Math.random() * CARD_COLORS.length);
    const kelas = this.kelasRepo.create({
      ...createDto,
      nomor,
      periode: currPeriod,
      warna: CARD_COLORS[colorIdx],
    });

    try {
      await this.kelasRepo.save(kelas);
    } catch {
      throw new InternalServerErrorException("Gagal membuat kelas baru");
    }

    return {
      id: kelas.id,
    };
  }

  async createMatkul(createDto: MataKuliah) {
    await this.mataKuliahRepo.insert(createDto);

    return { kode: createDto.kode };
  }

  async updateOrCreate(dto: UpdateKelasDto): Promise<IdKelasResDto> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    if (!dto.id) {
      // Create kelas
      if (!dto.mataKuliahKode) {
        throw new BadRequestException("Kode mata kuliah tidak boleh kosong");
      }

      return await this.create({
        mataKuliahKode: dto.mataKuliahKode,
        nomor: dto.nomor,
      });
    } else {
      // Update kelas
      const kelasQuery = this.kelasRepo
        .createQueryBuilder("kelas")
        .where("kelas.id = :id", { id: dto.id })
        .andWhere("kelas.periode = :periode", { periode: currPeriod });

      if (dto.nomor) {
        kelasQuery.andWhere("kelas.nomor = :nomor", { nomor: dto.nomor });
      }

      const kelas = await kelasQuery.getOne();

      if (!kelas) {
        throw new NotFoundException("Kelas tidak ditemukan");
      }

      try {
        await this.kelasRepo.update(kelas.id, dto);
      } catch {
        throw new InternalServerErrorException("Gagal memperbarui kelas");
      }

      return {
        id: kelas.id,
      };
    }
  }

  async delete(dto: DeleteKelasDto): Promise<Kelas> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    const kelasQuery = this.kelasRepo
      .createQueryBuilder("kelas")
      .where("kelas.nomor = :nomor", { nomor: dto.nomor })
      .andWhere("kelas.mataKuliahKode = :mataKuliahKode", {
        mataKuliahKode: dto.mataKuliahKode,
      })
      .andWhere("kelas.periode = :periode", { periode: currPeriod });

    const kelas = await kelasQuery.getOne();

    if (!kelas) {
      throw new BadRequestException("Kelas tidak ditemukan");
    }

    try {
      await this.kelasRepo.delete(kelas.id);
    } catch {
      throw new InternalServerErrorException("Gagal menghapus kelas");
    }

    return kelas;
  }

  async getAllMatkul(): Promise<MataKuliah[]> {
    return await this.mataKuliahRepo.find();
  }

  async getNextNomorKelas(kodeMatkul: string): Promise<number> {
    const currPeriod = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    const maxClass = await this.kelasRepo.findOne({
      where: {
        mataKuliahKode: kodeMatkul,
        periode: currPeriod,
      },
      order: {
        nomor: "DESC",
      },
    });

    return maxClass ? maxClass.nomor + 1 : 1;
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

    return mhs.map((m) => ({
      id: m.id,
      nama: m.nama,
      email: m.email,
      kelas: m?.[relation].map((k) => ({
        id: k.kelas.id,
        nomor: k.kelas.nomor,
        mataKuliahKode: k.kelas.mataKuliahKode,
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

    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const mhsId of dto.penggunaIds) {
        const currKelasQuery = queryRunner.manager
          .createQueryBuilder(MahasiswaKelas, "mahasiswaKelas")
          .leftJoinAndSelect("mahasiswaKelas.kelas", "kelas")
          .where("mahasiswaKelas.mahasiswaId = :mhsId", { mhsId })
          .andWhere("kelas.periode = :periode", { periode: currPeriod });

        const currKelas = (await currKelasQuery.getMany()).map(
          (k) => k.kelasId,
        );

        for (const kelasId of dto.kelasIds) {
          if (currKelas.includes(kelasId)) {
            continue;
          }

          await queryRunner.manager.insert(MahasiswaKelas, {
            mahasiswaId: mhsId,
            kelasId,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException("Gagal menambahkan kelas");
    } finally {
      await queryRunner.release();
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

    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const mhsId of dto.penggunaIds) {
        const currKelasQuery = queryRunner.manager
          .createQueryBuilder(MahasiswaKelas, "mahasiswaKelas")
          .leftJoinAndSelect("mahasiswaKelas.kelas", "kelas")
          .where("mahasiswaKelas.mahasiswaId = :mhsId", { mhsId })
          .andWhere("kelas.periode = :periode", { periode: currPeriod });

        const currKelas = (await currKelasQuery.getMany()).map(
          (k) => k.kelasId,
        );

        for (const kelasId of currKelas) {
          await queryRunner.manager.delete(MahasiswaKelas, {
            mahasiswaId: mhsId,
            kelasId,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException("Gagal menghapus kelas");
    } finally {
      await queryRunner.release();
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

    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const dosenId of dto.penggunaIds) {
        const currKelasQuery = queryRunner.manager
          .createQueryBuilder(PengajarKelas, "pengajarKelas")
          .leftJoinAndSelect("pengajarKelas.kelas", "kelas")
          .where("pengajarKelas.pengajarId = :dosenId", { dosenId })
          .andWhere("kelas.periode = :periode", { periode: currPeriod });

        const currKelas = (await currKelasQuery.getMany()).map(
          (k) => k.kelasId,
        );

        for (const kelasId of dto.kelasIds) {
          if (currKelas.includes(kelasId)) {
            continue;
          }

          await queryRunner.manager.insert(PengajarKelas, {
            pengajarId: dosenId,
            kelasId,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException("Gagal menambahkan kelas");
    } finally {
      await queryRunner.release();
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

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const dosenId of dto.penggunaIds) {
        const currKelasQuery = queryRunner.manager
          .createQueryBuilder(PengajarKelas, "pengajarKelas")
          .leftJoinAndSelect("pengajarKelas.kelas", "kelas")
          .where("pengajarKelas.pengajarId = :dosenId", { dosenId })
          .andWhere("kelas.periode = :periode", { periode: currPeriod });

        const currKelas = (await currKelasQuery.getMany()).map(
          (k) => k.kelasId,
        );

        for (const kelasId of currKelas) {
          await queryRunner.manager.delete(PengajarKelas, {
            pengajarId: dosenId,
            kelasId,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException("Gagal menghapus kelas");
    } finally {
      await queryRunner.release();
    }

    return { message: "Kelas berhasil dihapus" };
  }
}
