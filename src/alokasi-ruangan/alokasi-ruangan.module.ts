import { Module } from "@nestjs/common";
import { AlokasiRuanganController } from "./alokasi-ruangan.controller";
import { AlokasiRuanganService } from "./alokasi-ruangan.service";

@Module({
  controllers: [AlokasiRuanganController],
  providers: [AlokasiRuanganService],
})
export class AlokasiRuanganModule {}
