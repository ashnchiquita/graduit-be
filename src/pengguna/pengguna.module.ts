import { Module } from "@nestjs/common";
import { PenggunaService } from "./pengguna.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pengguna } from "src/entities/pengguna.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Pengguna])],
  providers: [PenggunaService],
  exports: [PenggunaService],
})
export class PenggunaModule {}
