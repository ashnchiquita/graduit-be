import { Module } from "@nestjs/common";
import { AlokasiTopikService } from "./alokasi-topik.service";
import { AlokasiTopikController } from "./alokasi-topik.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Topik } from "src/entities/topik.entity";
import { CustomStrategy } from "src/middlewares/custom.strategy";
import { AuthModule } from "src/auth/auth.module";
import { KonfigurasiModule } from "src/konfigurasi/konfigurasi.module";

@Module({
  imports: [TypeOrmModule.forFeature([Topik]), AuthModule, KonfigurasiModule],
  providers: [AlokasiTopikService, CustomStrategy],
  controllers: [AlokasiTopikController],
})
export class AlokasiTopikModule {}
