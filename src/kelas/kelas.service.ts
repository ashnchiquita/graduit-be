import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { Repository } from "typeorm";
import {
  CreateKelasDto,
  DeleteKelasDto,
  GetListKelasRespDto,
  IdKelasResDto,
  UpdateKelasDto,
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
      const maxClass = await this.kelasRepo.findOne({
        where: {
          mataKuliahKode: createDto.mataKuliahKode,
          periode: currPeriod,
        },
        order: {
          nomor: "DESC",
        },
      });

      nomor = maxClass ? maxClass.nomor + 1 : 1;
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
}
