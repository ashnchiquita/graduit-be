import { Module } from "@nestjs/common";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RegistrasiTesisController } from "./registrasi-tesis.controller";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import { Topik } from "src/entities/topik.entity";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { AuthModule } from "src/auth/auth.module";
import { PenggunaModule } from "src/pengguna/pengguna.module";
import { PenggunaService } from "src/pengguna/pengguna.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pengguna,
      DosenBimbingan,
      PendaftaranTesis,
      Topik,
    ]),
    AuthModule,
    PenggunaModule,
    HttpModule,
  ],
  controllers: [RegistrasiTesisController],
  providers: [RegistrasiTesisService, CustomStrategy, PenggunaService],
  exports: [RegistrasiTesisService],
})
export class RegistrasiTesisModule {}
