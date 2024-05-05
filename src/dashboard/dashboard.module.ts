import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BimbinganModule } from "src/bimbingan/bimbingan.module";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { PendaftaranSidsem } from "src/entities/pendaftaranSidsem";
import { PendaftaranTesis } from "../entities/pendaftaranTesis.entity";
import { Pengguna } from "../entities/pengguna.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PendaftaranTesis,
      Pengguna,
      PendaftaranSidsem,
      DosenBimbingan,
    ]),
    BimbinganModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
