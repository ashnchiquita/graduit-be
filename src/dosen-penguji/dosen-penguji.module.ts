import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pengguna } from "src/entities/pengguna.entity";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { DosenPengujiController } from "./dosen-penguji.controller";
import { DosenPengujiService } from "./dosen-penguji.service";

@Module({
  imports: [TypeOrmModule.forFeature([Pengguna]), AuthModule],
  controllers: [DosenPengujiController],
  providers: [DosenPengujiService, CustomStrategy],
})
export class DosenPengujiModule {}
