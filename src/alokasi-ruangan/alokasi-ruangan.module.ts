import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { PendaftaranSidsem } from "src/entities/pendaftaranSidsem";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { PengujiSidsem } from "src/entities/pengujiSidsem.entity";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { AlokasiRuanganController } from "./alokasi-ruangan.controller";
import { AlokasiRuanganService } from "./alokasi-ruangan.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PendaftaranSidsem,
      PengujiSidsem,
      DosenBimbingan,
      PendaftaranTesis,
      Pengguna,
    ]),
    AuthModule,
  ],
  controllers: [AlokasiRuanganController],
  providers: [AlokasiRuanganService, CustomStrategy],
})
export class AlokasiRuanganModule {}
