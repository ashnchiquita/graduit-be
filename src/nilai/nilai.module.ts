import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { Kelas } from "src/entities/kelas.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";
import { MataKuliah } from "src/entities/mataKuliah.entity";
import { KelasModule } from "src/kelas/kelas.module";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";
import { NilaiController } from "./nilai.controller";
import { NilaiService } from "./nilai.service";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { KelasService } from "src/kelas/kelas.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([MahasiswaKelas, Kelas, MataKuliah, Konfigurasi]),
    AuthModule,
    KonfigurasiModule,
    KelasModule,
  ],
  controllers: [NilaiController],
  providers: [NilaiService, CustomStrategy, KelasService, KonfigurasiService],
})
export class NilaiModule {}
