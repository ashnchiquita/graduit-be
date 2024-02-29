import { Module } from "@nestjs/common";
import { RegistrasiTesisController } from "./registrasi-tesis.controller";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PengajuanPengambilanTopik } from "src/entities/pengajuanPengambilanTopik.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PengajuanPengambilanTopik])],
  controllers: [RegistrasiTesisController],
  providers: [RegistrasiTesisService],
})
export class RegistrasiTesisModule {}
