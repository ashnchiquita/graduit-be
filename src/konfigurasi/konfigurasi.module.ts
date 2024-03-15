import { Module } from "@nestjs/common";
import { KonfigurasiController } from "./konfigurasi.controller";
import { KonfigurasiService } from "./konfigurasi.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Konfigurasi } from "src/entities/konfigurasi.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Konfigurasi])],
  controllers: [KonfigurasiController],
  providers: [KonfigurasiService],
})
export class KonfigurasiModule {}
