import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { PendaftaranSidsem } from "src/entities/pendaftaranSidsem";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { RegistrasiSidsemController } from "./registrasi-sidsem.controller";
import { RegistrasiSidsemService } from "./registrasi-sidsem.service";
import { RegistrasiTesisService } from "src/registrasi-tesis/registrasi-tesis.service";
import { RegistrasiTesisModule } from "src/registrasi-tesis/registrasi-tesis.module";
import { BerkasSidsem } from "src/entities/berkasSidsem.entity";
import { Topik } from "src/entities/topik.entity";
import { PenggunaModule } from "src/pengguna/pengguna.module";
import { PengujiSidsem } from "src/entities/pengujiSidsem.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PendaftaranSidsem,
      DosenBimbingan,
      PendaftaranTesis,
      Pengguna,
      BerkasSidsem,
      Topik,
      PengujiSidsem,
    ]),
    AuthModule,
    RegistrasiTesisModule,
    PenggunaModule,
  ],
  controllers: [RegistrasiSidsemController],
  providers: [RegistrasiSidsemService, CustomStrategy, RegistrasiTesisService],
})
export class RegistrasiSidsemModule {}
