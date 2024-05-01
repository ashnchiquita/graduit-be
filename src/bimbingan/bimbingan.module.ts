import { Module } from "@nestjs/common";
import { BimbinganController } from "./bimbingan.controller";
import { BimbinganService } from "./bimbingan.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { BerkasBimbingan } from "src/entities/berkasBimbingan.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bimbingan,
      PendaftaranTesis,
      DosenBimbingan,
      BerkasBimbingan,
    ]),
  ],
  controllers: [BimbinganController],
  providers: [BimbinganService],
  exports: [BimbinganService],
})
export class BimbinganModule {}
