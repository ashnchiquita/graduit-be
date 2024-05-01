import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { PendaftaranTesis } from "../entities/pendaftaranTesis.entity";
import { Pengguna } from "../entities/pengguna.entity";
import { Topik } from "../entities/topik.entity";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { PendaftaranSidsem } from "src/entities/pendaftaranSidsem";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { BimbinganModule } from "src/bimbingan/bimbingan.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PendaftaranTesis,
      Pengguna,
      Topik,
      Bimbingan,
      PendaftaranSidsem,
      DosenBimbingan,
    ]),
    BimbinganModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
