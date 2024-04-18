import { Module } from "@nestjs/common";
import { SubmisiTugasController } from "./submisi-tugas.controller";
import { SubmisiTugasService } from "./submisi-tugas.service";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";
import { SubmisiTugas } from "src/entities/submisiTugas.entity";
import { BerkasSubmisiTugas } from "src/entities/berkasSubmisiTugas.entity";
import { TugasModule } from "src/tugas/tugas.module";
import { Pengguna } from "src/entities/pengguna.entity";
import { Tugas } from "src/entities/tugas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubmisiTugas,
      BerkasSubmisiTugas,
      Pengguna,
      Tugas,
      MahasiswaKelas,
    ]),
    AuthModule,
    KonfigurasiModule,
    TugasModule,
  ],
  controllers: [SubmisiTugasController],
  providers: [SubmisiTugasService, CustomStrategy],
})
export class SubmisiTugasModule {}
