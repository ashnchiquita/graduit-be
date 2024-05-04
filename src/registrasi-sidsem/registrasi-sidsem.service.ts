import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  cmpTipeSidsem,
  PendaftaranSidsem,
  SidsemStatus,
  TipeSidsemEnum,
} from "src/entities/pendaftaranSidsem";
import { PengujiSidsem } from "src/entities/pengujiSidsem.entity";
import { DataSource, In, Repository, Brackets } from "typeorm";
import {
  CreatePengajuanSidsemDto,
  GetAllPengajuanSidangItemDto,
  GetAllPengajuanSidangReqQueryDto,
  GetAllPengajuanSidangRespDto,
  GetOnePengajuanSidangRespDto,
  PengajuanSidsemIdDto,
  UpdateSidsemDetailDto,
} from "./registrasi-sidsem.dto";
import { RegStatus } from "src/entities/pendaftaranTesis.entity";
import { RegistrasiTesisService } from "src/registrasi-tesis/registrasi-tesis.service";
import { BerkasSidsem } from "src/entities/berkasSidsem.entity";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";

@Injectable()
export class RegistrasiSidsemService {
  constructor(
    @InjectRepository(PendaftaranSidsem)
    private pendaftaranSidsemRepo: Repository<PendaftaranSidsem>,
    @InjectRepository(PengujiSidsem)
    private pengujiSidsemRepo: Repository<PengujiSidsem>,
    @InjectRepository(Pengguna)
    private penggunaRepo: Repository<Pengguna>,
    @InjectRepository(BerkasSidsem)
    private berkasSidsemRepo: Repository<BerkasSidsem>,
    private regTesisService: RegistrasiTesisService,
    private dataSource: DataSource,
  ) {}

  private async getLatestPendaftaranSidsem(mhsId: string) {
    return await this.pendaftaranSidsemRepo
      .createQueryBuilder("ps")
      .select([
        "ps.id",
        "ps.tipe",
        "ps.jadwal",
        "ps.ruangan",
        "ps.status",
        "ps.judulSidsem",
        "ps.deskripsiSidsem",
        "berkasSidsem",
        "pt.id",
        "pt.jalurPilihan",
        "mahasiswa.id",
        "mahasiswa.nim",
        "mahasiswa.nama",
        "mahasiswa.email",
        "topik.judul",
        "topik.deskripsi",
        "dosenBimbingan.id",
        "dosen.id",
        "dosen.nama",
        "penguji.id",
        "dosenPenguji.id",
        "dosenPenguji.nama",
      ])
      .leftJoin("ps.penguji", "penguji")
      .leftJoin("ps.berkasSidsem", "berkasSidsem")
      .leftJoin("penguji.dosen", "dosenPenguji")
      .leftJoin("ps.pendaftaranTesis", "pt")
      .leftJoin("pt.mahasiswa", "mahasiswa")
      .leftJoin("pt.topik", "topik")
      .leftJoin("pt.dosenBimbingan", "dosenBimbingan")
      .leftJoin("dosenBimbingan.dosen", "dosen")
      .where("pt.mahasiswaId = :mhsId", { mhsId })
      .andWhere("mahasiswa.aktif = true")
      .orderBy("ps.waktuPengiriman", "DESC")
      .getOne();
  }

  async create(
    mhsId: string,
    dto: CreatePengajuanSidsemDto,
  ): Promise<PengajuanSidsemIdDto> {
    const regTesis = await this.regTesisService.getNewestRegByMhsOrFail(mhsId);

    if (regTesis.status !== RegStatus.APPROVED) {
      throw new BadRequestException(
        "Mahasiswa belum diterima sebagai mahasiswa tesis.",
      );
    }

    // Check if mahasiswa already has pending registration
    const lastPendaftaran = await this.getLatestPendaftaranSidsem(mhsId);
    if (lastPendaftaran) {
      const delta = cmpTipeSidsem(dto.tipe, lastPendaftaran.tipe);

      if (
        (delta !== 0 && delta !== 1) ||
        (delta === 0 && lastPendaftaran.status !== SidsemStatus.REJECTED) ||
        (delta === 1 && lastPendaftaran.status !== SidsemStatus.APPROVED)
      ) {
        {
          throw new BadRequestException("Tipe sidsem invalid");
        }
      }
    } else {
      if (dto.tipe !== TipeSidsemEnum.SEMINAR_1) {
        throw new BadRequestException("Tipe sidsem invalid");
      }
    }

    const berkasSidsem = dto.berkasSidsem.map((berkasSubmisiTugas) =>
      this.berkasSidsemRepo.create(berkasSubmisiTugas),
    );

    // Create new registration
    const createdRegistration = this.pendaftaranSidsemRepo.create({
      ...dto,
      pendaftaranTesis: regTesis,
      berkasSidsem,
    });

    await this.pendaftaranSidsemRepo.save(createdRegistration);

    return {
      id: createdRegistration.id,
    };
  }

  async findAll(
    query: GetAllPengajuanSidangReqQueryDto,
    idPembimbing?: string,
    idPenguji?: string,
  ): Promise<GetAllPengajuanSidangRespDto> {
    const baseQuery = this.pendaftaranSidsemRepo
      .createQueryBuilder("ps")
      .select([
        "ps.id",
        "ps.tipe",
        "ps.status",
        "pt.id",
        "mahasiswa.id",
        "mahasiswa.nim",
        "mahasiswa.nama",
        "dosenBimbingan.id",
        "dosen.id",
        "dosen.nama",
        "berkasSidsem",
      ])
      .innerJoinAndSelect(
        (qb) =>
          qb
            .select([
              "ps.pendaftaranTesisId AS latest_pendaftaranTesisId",
              "MAX(ps.waktuPengiriman) AS latestPengiriman",
            ])
            .from(PendaftaranSidsem, "ps")
            .groupBy("ps.pendaftaranTesisId"),
        "latest",
        "latest.latest_pendaftaranTesisId = ps.pendaftaranTesisId AND ps.waktuPengiriman = latest.latestPengiriman",
      )
      .leftJoin("ps.pendaftaranTesis", "pt")
      .leftJoin("ps.berkasSidsem", "berkasSidsem")
      .leftJoin("pt.dosenBimbingan", "dosenBimbingan")
      .leftJoin("dosenBimbingan.dosen", "dosen")
      .leftJoin("pt.mahasiswa", "mahasiswa")
      .where("mahasiswa.aktif = true")
      .orderBy("ps.waktuPengiriman", "DESC");

    if (idPembimbing) {
      baseQuery
        .innerJoin("pt.dosenBimbingan", "dosenBimbinganFilter")
        .andWhere("dosenBimbinganFilter.idDosen = :idPembimbing", {
          idPembimbing,
        });
    }

    if (idPenguji) {
      baseQuery
        .innerJoin("ps.penguji", "pengujiFilter")
        .andWhere("pengujiFilter.idDosen = :idPenguji", {
          idPenguji,
        });
    }

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
      idMahasiswa: res.pendaftaranTesis.mahasiswa.id,
      nimMahasiswa: res.pendaftaranTesis.mahasiswa.nim,
      namaMahasiswa: res.pendaftaranTesis.mahasiswa.nama,
      jadwalSidang: !!res.jadwal ? res.jadwal.toISOString() : null,
      jenisSidang: res.tipe,
      ruangan: res.ruangan,
      status: res.status,
      dosenPembimbing: res.pendaftaranTesis.dosenBimbingan.map(
        (dosen) => dosen.dosen.nama,
      ),
      berkasSidsem: res.berkasSidsem,
    }));

    return { data, total };
  }

  async findOne(
    mhsId: string,
    idPembimbing?: string,
    idPenguji?: string,
  ): Promise<GetOnePengajuanSidangRespDto> {
    const latest = await this.getLatestPendaftaranSidsem(mhsId);

    if (!latest) {
      throw new NotFoundException("Pendaftaran sidsem tidak ditemukan");
    }

    function isPembimbing() {
      return latest.pendaftaranTesis.dosenBimbingan.some(
        ({ dosen: { id } }) => id === idPembimbing,
      );
    }

    function isPenguji() {
      return latest.penguji.some(({ dosen: { id } }) => id === idPenguji);
    }

    if (idPembimbing && idPenguji) {
      if (!isPembimbing() && !isPenguji()) {
        throw new ForbiddenException(
          "Anda tidak terdaftar sebagai pembimbing atau penguji",
        );
      }
    } else if (idPembimbing) {
      if (!isPembimbing()) {
        throw new ForbiddenException("Anda tidak terdaftar sebagai pembimbing");
      }
    } else if (idPenguji) {
      if (!isPenguji()) {
        throw new ForbiddenException("Anda tidak terdaftar sebagai penguji");
      }
    }

    const data: GetOnePengajuanSidangRespDto = {
      idPengajuanSidsem: latest.id,
      idMahasiswa: latest.pendaftaranTesis.mahasiswa.id,
      nimMahasiswa: latest.pendaftaranTesis.mahasiswa.nim,
      namaMahasiswa: latest.pendaftaranTesis.mahasiswa.nama,
      emailMahasiswa: latest.pendaftaranTesis.mahasiswa.email,
      jadwalSidang: latest.jadwal ? latest.jadwal.toISOString() : null,
      jenisSidang: latest.tipe,
      ruangan: latest.ruangan,
      jalurPilihan: latest.pendaftaranTesis.jalurPilihan,
      judulTopik: latest.pendaftaranTesis.topik.judul,
      deskripsiTopik: latest.pendaftaranTesis.topik.deskripsi,
      status: latest.status,
      berkasSidsem: latest.berkasSidsem,
      dosenPembimbing: latest.pendaftaranTesis.dosenBimbingan.map(
        ({ dosen: { nama } }) => nama,
      ),
      dosenPenguji: latest.penguji.map(({ dosen: { nama } }) => nama),
    };

    return data;
  }

  async updateStatus(
    mhsId: string,
    status: SidsemStatus.REJECTED | SidsemStatus.APPROVED,
  ): Promise<PengajuanSidsemIdDto> {
    const latest = await this.getLatestPendaftaranSidsem(mhsId);

    if (!latest || latest.status !== SidsemStatus.NOT_ASSIGNED) {
      throw new BadRequestException(
        "Pendaftaran sidsem yang pending tidak ditemukan",
      );
    }

    await this.pendaftaranSidsemRepo.update(latest.id, {
      status,
    });

    return { id: latest.id } as PengajuanSidsemIdDto;
  }

  async updateDetail(
    mhsId: string,
    updateDto: UpdateSidsemDetailDto,
  ): Promise<PengajuanSidsemIdDto> {
    const latest = await this.getLatestPendaftaranSidsem(mhsId);

    if (!latest || latest.status !== SidsemStatus.APPROVED) {
      throw new BadRequestException(
        "Pendaftaran sidsem yang disetujui tidak ditemukan",
      );
    }

    if (updateDto.dosenPengujiIds) {
      const newPengujiList = await this.penggunaRepo.findBy({
        id: In(updateDto.dosenPengujiIds),
      });

      if (
        newPengujiList.length !== updateDto.dosenPengujiIds.length ||
        newPengujiList.some(
          (dosen) => !dosen.roles.includes(RoleEnum.S2_PENGUJI),
        )
      )
        throw new BadRequestException(
          "Dosen id list contains invalid user ids",
        );

      const currentPenguji = await this.pengujiSidsemRepo.findBy({
        idSidsem: latest.id,
      });

      const newPengujiIds = newPengujiList.map((dosen) => dosen.id);
      const currentPengujiIds = currentPenguji.map(
        (currentPembimbing) => currentPembimbing.idDosen,
      );

      const idsToBeAdded = newPengujiIds.filter(
        (newId) => !currentPengujiIds.includes(newId),
      );

      const idsToBeDeleted = currentPengujiIds.filter(
        (newId) => !newPengujiIds.includes(newId),
      );

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.insert(
          PengujiSidsem,
          idsToBeAdded.map((idDosen) => ({ sidsem: latest, idDosen })),
        );
        await queryRunner.manager.delete(PengujiSidsem, {
          idDosen: In(idsToBeDeleted),
        });

        if (updateDto.ruangan || updateDto.jadwal) {
          await queryRunner.manager.update(PendaftaranSidsem, latest.id, {
            ruangan: updateDto.ruangan,
            jadwal: updateDto.jadwal,
          });
        }

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();

        console.error(err);

        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
    } else {
      await this.pendaftaranSidsemRepo.update(latest.id, {
        ...updateDto,
      });
    }

    return { id: latest.id } as PengajuanSidsemIdDto;
  }
}
