import { Module } from "@nestjs/common";
import { DosenBimbinganController } from "./dosen-bimbingan.controller";
import { DosenBimbinganService } from "./dosen-bimbingan.service";
import { AuthModule } from "src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pengguna } from "src/entities/pengguna.entity";
import { CustomStrategy } from "src/middlewares/custom.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([Pengguna]), AuthModule],
  controllers: [DosenBimbinganController],
  providers: [DosenBimbinganService, CustomStrategy],
})
export class DosenBimbinganModule {}
