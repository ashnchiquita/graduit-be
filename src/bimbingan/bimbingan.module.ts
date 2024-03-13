import { Module } from "@nestjs/common";
import { BimbinganController } from "./bimbingan.controller";
import { BimbinganService } from "./bimbingan.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Bimbingan, PendaftaranTesis])],
  controllers: [BimbinganController],
  providers: [BimbinganService],
})
export class BimbinganModule {}
