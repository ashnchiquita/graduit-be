import { Module } from "@nestjs/common";
import { BimbinganController } from "./bimbingan.controller";
import { BimbinganService } from "./bimbingan.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { Konfigurasi } from "src/entities/konfigurasi.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Bimbingan, PendaftaranTesis, Konfigurasi]),
  ],
  controllers: [BimbinganController],
  providers: [BimbinganService],
})
export class BimbinganModule {}
