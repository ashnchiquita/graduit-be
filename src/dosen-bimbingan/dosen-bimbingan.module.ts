import { Module } from "@nestjs/common";
import { DosenBimbinganController } from "./dosen-bimbingan.controller";
import { DosenBimbinganService } from "./dosen-bimbingan.service";
import { AuthModule } from "src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PendaftaranTesis, DosenBimbingan, Pengguna]),
    AuthModule,
    KonfigurasiModule,
  ],
  controllers: [DosenBimbinganController],
  providers: [DosenBimbinganService],
})
export class DosenBimbinganModule {}
