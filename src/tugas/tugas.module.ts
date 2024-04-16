import { Module } from "@nestjs/common";
import { TugasController } from "./tugas.controller";
import { TugasService } from "./tugas.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PengajarKelas } from "src/entities/pengajarKelas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";
import { Tugas } from "src/entities/tugas.entity";
import { SubmisiTugas } from "src/entities/submisiTugas.entity";
import { AuthModule } from "src/auth/auth.module";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { BerkasTugas } from "src/entities/berkasTugas.entity";
import { BerkasSubmisiTugas } from "src/entities/berkasSubmisiTugas.entity";
import { Kelas } from "src/entities/kelas.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { KelasModule } from "src/kelas/kelas.module";
import { KelasService } from "src/kelas/kelas.service";
import { MataKuliah } from "src/entities/mataKuliah.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { Konfigurasi } from "src/entities/konfigurasi.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PengajarKelas,
      MahasiswaKelas,
      Tugas,
      SubmisiTugas,
      BerkasTugas,
      BerkasSubmisiTugas,
      Kelas,
      Pengguna,
      MataKuliah,
      Konfigurasi,
    ]),
    AuthModule,
    KonfigurasiModule,
    KelasModule,
  ],
  controllers: [TugasController],
  providers: [TugasService, CustomStrategy, KelasService, KonfigurasiService],
  exports: [TugasService],
})
export class TugasModule {}
