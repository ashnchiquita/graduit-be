import { Module } from "@nestjs/common";
import { AkunController } from "./akun.controller";
import { AkunService } from "./akun.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pengguna } from "src/entities/pengguna.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Pengguna])],
  controllers: [AkunController],
  providers: [AkunService],
})
export class AkunModule {}
