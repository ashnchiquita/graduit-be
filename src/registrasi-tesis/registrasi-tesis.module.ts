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
  ],
  controllers: [RegistrasiTesisController],
  providers: [RegistrasiTesisService, CustomStrategy, PenggunaService],
})
export class RegistrasiTesisModule {}
