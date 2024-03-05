import { Module } from "@nestjs/common";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RegistrasiTesisController } from "./registrasi-tesis.controller";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import { Topik } from "src/entities/topik.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pengguna,
      DosenBimbingan,
      PengajuanPengambilanTopik,
      Topik,
    ]),
  ],
  controllers: [RegistrasiTesisController],
  providers: [RegistrasiTesisService],
})
export class RegistrasiTesisModule {}
