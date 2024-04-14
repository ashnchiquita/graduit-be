import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubmisiController } from "./submisi.controller";
import { SubmisiService } from "./submisi.service";
import { SubmisiTugas } from "src/entities/submisiTugas";
import { Tugas } from "src/entities/tugas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { BerkasSubmisiTugas } from "src/entities/berkasSubmisiTugas";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubmisiTugas,
      Tugas,
      MahasiswaKelas,
      Konfigurasi,
      BerkasSubmisiTugas,
    ]),
  ],
  controllers: [SubmisiController],
  providers: [SubmisiService],
})
export class SubmisiModule {}
