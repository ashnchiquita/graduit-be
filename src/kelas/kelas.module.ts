import { Module } from "@nestjs/common";
import { KelasService } from "./kelas.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { AuthModule } from "src/auth/auth.module";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";
import { KelasController } from "./kelas.controller";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { MataKuliah } from "src/entities/mataKuliah";
import { Pengguna } from "src/entities/pengguna.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas";
import { PengajarKelas } from "src/entities/pengajarKelas.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kelas,
      MataKuliah,
      Pengguna,
      MahasiswaKelas,
      PengajarKelas,
    ]),
    AuthModule,
    KonfigurasiModule,
  ],
  controllers: [KelasController],
  providers: [KelasService, CustomStrategy],
})
export class KelasModule {}
