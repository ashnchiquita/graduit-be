import { Module } from "@nestjs/common";
import { AlokasiTopikService } from "./alokasi-topik.service";
import { AlokasiTopikController } from "./alokasi-topik.controller";

@Module({
  providers: [AlokasiTopikService],
  controllers: [AlokasiTopikController],
})
export class AlokasiTopikModule {}
