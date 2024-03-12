import { Module } from "@nestjs/common";
import { AlokasiTopikService } from "./alokasi-topik.service";
import { AlokasiTopikController } from "./alokasi-topik.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Topik } from "src/entities/topik.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Topik])],
  providers: [AlokasiTopikService],
  controllers: [AlokasiTopikController],
})
export class AlokasiTopikModule {}
