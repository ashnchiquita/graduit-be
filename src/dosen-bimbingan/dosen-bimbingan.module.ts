import { Module } from "@nestjs/common";
import { DosenBimbinganController } from "./dosen-bimbingan.controller";
import { DosenBimbinganService } from "./dosen-bimbingan.service";
import { AuthModule } from "src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { DosenBimbingan } from "src/entities/dosenBimbingan.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { CustomStrategy } from "src/middlewares/custom.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([PendaftaranTesis, DosenBimbingan, Pengguna]),
    AuthModule,
  ],
  controllers: [DosenBimbinganController],
  providers: [DosenBimbinganService, CustomStrategy],
})
export class DosenBimbinganModule {}
