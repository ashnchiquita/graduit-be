import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { Brackets, DataSource, Repository } from "typeorm";
import {
  CreateKelasDto,
  AssignKelasDto,
  DeleteKelasDto,
  GetKelasDetailRespDto,
  GetKelasRespDto,
  IdKelasResDto,
  UpdateKelasDto,
  MessageResDto,
  UnassignKelasDto,
  UpdateKelasPenggunaDto,
  ByIdKelasDto,
} from "./kelas.dto";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { MataKuliah } from "src/entities/mataKuliah.entity";
import { CARD_COLORS } from "./kelas.constant";
import { Pengguna } from "src/entities/pengguna.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";
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
    private datasource: DataSource,
  ) {}
  async getListKelas(
    idMahasiswa?: string,
    idPengajar?: string,
    kodeMatkul?: string,
    search?: string,
  ) {
    const currPeriod = await this.konfService.getPeriodeOrFail();

    let baseQuery = this.kelasRepo
      .createQueryBuilder("kelas")
      .leftJoinAndSelect("kelas.mahasiswa", "mahasiswa")
      .leftJoinAndSelect("kelas.mataKuliah", "mataKuliah")
      .select([
        "kelas.id AS id",
        "kelas.nomor AS nomor",
        "kelas.warna AS warna",
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

    const mapped: GetKelasRespDto[] = result.map((r) => ({
      id: r.id,
      nomor: "K" + `${r.nomor}`.padStart(2, "0"),
      kode_mata_kuliah: r.kode_mata_kuliah,
      nama_mata_kuliah: r.nama_mata_kuliah,
      jumlah_mahasiswa: parseInt(r.jumlah_mahasiswa),
      warna: r.warna,
    }));

    return mapped;
  }

  async getById(id: string, idMahasiswa?: string, idPengajar?: string) {
    const currPeriod = await this.konfService.getPeriodeOrFail();

    let baseQuery = this.kelasRepo
      .createQueryBuilder("kelas")
      .leftJoinAndSelect("kelas.mahasiswa", "mahasiswa")
      .leftJoinAndSelect("kelas.mataKuliah", "mataKuliah")
      .select([
        "kelas.id AS id",
        "kelas.nomor AS nomor",
        "kelas.warna AS warna",
        "mataKuliah.kode AS kode_mata_kuliah",
        "mataKuliah.nama AS nama_mata_kuliah",
        "COUNT(mahasiswa) AS jumlah_mahasiswa",
      ])
      .where("kelas.id = :id", { id })
      .andWhere("kelas.periode = :periode", { periode: currPeriod });

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
      .getRawOne();

    if (!result) {
      throw new NotFoundException("Kelas tidak ditemukan");
    }

    const mapped: GetKelasRespDto = {
      id: result.id,
      nomor: "K" + `${result.nomor}`.padStart(2, "0"),
      kode_mata_kuliah: result.kode_mata_kuliah,
      nama_mata_kuliah: result.nama_mata_kuliah,
      jumlah_mahasiswa: parseInt(result.jumlah_mahasiswa),
      warna: result.warna,
    };

    return mapped;
  }

  async getKelasDetail(
    idKelas: string,
    idMahasiswa?: string,
    idPengajar?: string,
  ) {
    const currPeriod = await this.konfService.getPeriodeOrFail();

    let baseQuery = this.kelasRepo
      .createQueryBuilder("kelas")
      .leftJoinAndSelect("kelas.mahasiswa", "mahasiswaKelas")
      .leftJoinAndSelect("mahasiswaKelas.mahasiswa", "mahasiswa")
      .leftJoinAndSelect("kelas.pengajar", "pengajarKelas")
      .leftJoinAndSelect("pengajarKelas.pengajar", "pengajar")
      .select([
        "kelas.id",
        "mahasiswaKelas.id",
        "mahasiswa.id",
        "mahasiswa.nim",
        "mahasiswa.nama",
        "pengajarKelas.id",
        "pengajar.id",
        "pengajar.nama",
      ])
      .orderBy("pengajar.nama", "ASC")
      .addOrderBy("mahasiswa.nim", "ASC")
      .where("kelas.id = :idKelas", { idKelas })
      .andWhere("kelas.periode = :periode", { periode: currPeriod });

    if (idMahasiswa) {
      baseQuery = baseQuery
        .innerJoin("kelas.mahasiswa", "mahasiswaFilter")
        .andWhere("mahasiswaFilter.mahasiswaId = :idMahasiswa", {
          idMahasiswa,
        });
    }

    if (idPengajar) {
      baseQuery = baseQuery
        .innerJoin("kelas.pengajar", "pengajarFilter")
        .andWhere("pengajarFilter.pengajarId = :idPengajar", {
          idPengajar,
        });
    }

    const result = await baseQuery.getOne();

    if (!result) {
      throw new NotFoundException(
        "Kelas tidak ditemukan di antara kelas yang dapat Anda akses",
      );
    }

    const mapped: GetKelasDetailRespDto = {
      id: result.id,
      pengajar: result.pengajar.map((p) => ({
        id: p.pengajar.id,
        nama: p.pengajar.nama,
      })),
      mahasiswa: result.mahasiswa.map((m) => ({
        id: m.mahasiswa.id,
        nim: m.mahasiswa.nim,
        nama: m.mahasiswa.nama,
      })),
    };

    return mapped;
  }

  async create(createDto: CreateKelasDto): Promise<IdKelasResDto> {
    const currPeriod = await this.konfService.getPeriodeOrFail();

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

  async getKelasPengguna(
    mode: "MAHASISWA" | "DOSEN",
    search?: string,
    id?: string,
  ) {
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
      .leftJoinAndSelect("kelas.mataKuliah", "mataKuliah")
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

    if (id) {
      penggunaQuery = penggunaQuery.andWhere("pengguna.id = :id", { id });
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
        mataKuliahNama: k.kelas.mataKuliah.nama,
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

  async updateOrCreate(dto: UpdateKelasDto): Promise<IdKelasResDto> {
    const currPeriod = await this.konfService.getPeriodeOrFail();

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
    const currPeriod = await this.konfService.getPeriodeOrFail();

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
    const currPeriod = await this.konfService.getPeriodeOrFail();

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

  async updateKelas(
    dto: UpdateKelasPenggunaDto,
    mode: "MAHASISWA" | "DOSEN",
  ): Promise<ByIdKelasDto> {
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
      if (mode === "MAHASISWA") {
        const currKelasQuery = queryRunner.manager
          .createQueryBuilder(MahasiswaKelas, "mahasiswaKelas")
          .leftJoinAndSelect("mahasiswaKelas.kelas", "kelas")
          .where("mahasiswaKelas.mahasiswaId = :mhsId", {
            mhsId: dto.penggunaId,
          })
          .andWhere("kelas.periode = :periode", { periode: currPeriod });

        const currKelas = (await currKelasQuery.getMany()).map(
          (k) => k.kelasId,
        );

        // Delete all kelas mahasiswa
        for (const kelasId of currKelas) {
          await queryRunner.manager.delete(MahasiswaKelas, {
            mahasiswaId: dto.penggunaId,
            kelasId,
          });
        }

        // Assign kelas mahasiswa
        for (const kelasId of dto.kelasIds) {
          await queryRunner.manager.insert(MahasiswaKelas, {
            mahasiswaId: dto.penggunaId,
            kelasId,
          });
        }
      } else {
        const currKelasQuery = queryRunner.manager
          .createQueryBuilder(PengajarKelas, "pengajarKelas")
          .leftJoinAndSelect("pengajarKelas.kelas", "kelas")
          .where("pengajarKelas.pengajarId = :dosenId", {
            dosenId: dto.penggunaId,
          })
          .andWhere("kelas.periode = :periode", { periode: currPeriod });

        const currKelas = (await currKelasQuery.getMany()).map(
          (k) => k.kelasId,
        );

        for (const kelasId of currKelas) {
          await queryRunner.manager.delete(PengajarKelas, {
            pengajarId: dto.penggunaId,
            kelasId,
          });
        }

        for (const kelasId of dto.kelasIds) {
          await queryRunner.manager.insert(PengajarKelas, {
            pengajarId: dto.penggunaId,
            kelasId,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException("Gagal mengupdate kelas pengguna");
    } finally {
      await queryRunner.release();
    }

    return { id: dto.penggunaId };
  }
}
