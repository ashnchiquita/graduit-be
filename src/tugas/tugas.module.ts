import { Module } from "@nestjs/common";
import { TugasController } from "./tugas.controller";
import { TugasService } from "./tugas.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PengajarKelas } from "src/entities/pengajarKelas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas";
import { Tugas } from "src/entities/tugas.entity";
import { SubmisiTugas } from "src/entities/submisiTugas";
import { AuthModule } from "src/auth/auth.module";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { BerkasTugas } from "src/entities/berkasTugas";
import { BerkasSubmisiTugas } from "src/entities/berkasSubmisiTugas";
import { Kelas } from "src/entities/kelas.entity";
import { Pengguna } from "src/entities/pengguna.entity";

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
    ]),
    AuthModule,
    KonfigurasiModule,
  ],
  controllers: [TugasController],
  providers: [TugasService, CustomStrategy],
})
export class TugasModule {}
