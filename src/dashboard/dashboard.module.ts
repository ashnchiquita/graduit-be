import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { PendaftaranTesis } from "../entities/pendaftaranTesis.entity";
import { Pengguna } from "../entities/pengguna.entity";
import { Topik } from "../entities/topik.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { Seminar } from "src/entities/seminar.entity";
import { Sidang } from "src/entities/sidang.entity";
import { Bimbingan } from "src/entities/bimbingan.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PendaftaranTesis,
      Pengguna,
      Topik,
      Konfigurasi,
      Seminar,
      Sidang,
      Bimbingan,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
