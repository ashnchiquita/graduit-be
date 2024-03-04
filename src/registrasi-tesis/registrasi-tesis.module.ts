import { Module } from "@nestjs/common";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RegistrasiTesisController } from "./registrasi-tesis.controller";
import { RegistrasiTesisService } from "./registrasi-tesis.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pengguna,
      DosenBimbingan,
      PengajuanPengambilanTopik,
    ]),
    HttpModule,
  ],
  controllers: [RegistrasiTesisController],
  providers: [RegistrasiTesisService],
})
export class RegistrasiTesisModule {}
