import { Module } from "@nestjs/common";
import { KelasService } from "./kelas.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Kelas } from "src/entities/kelas.entity";
import { AuthModule } from "src/auth/auth.module";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";
import { KelasController } from "./kelas.controller";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { MataKuliah } from "src/entities/mataKuliah";

@Module({
  imports: [
    TypeOrmModule.forFeature([Kelas, MataKuliah]),
    AuthModule,
    KonfigurasiModule,
  ],
  controllers: [KelasController],
  providers: [KelasService, CustomStrategy],
})
export class KelasModule {}
