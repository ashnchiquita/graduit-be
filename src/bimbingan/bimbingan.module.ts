import { Module } from "@nestjs/common";
import { BimbinganController } from "./bimbingan.controller";
import { BimbinganService } from "./bimbingan.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Bimbingan, PengajuanPengambilanTopik])],
  controllers: [BimbinganController],
  providers: [BimbinganService],
})
export class BimbinganModule {}
