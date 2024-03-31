import { IsDateString, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { JalurEnum } from "src/entities/pendaftaranTesis.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";

export class GetByMahasiswaIdResDto {
  bimbingan: Bimbingan[];
  mahasiswa: Pengguna & { jalurPilihan: JalurEnum };
  topik: Topik;
}

export class CreateBimbinganReqDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  waktuBimbingan: string;

  @ApiProperty()
  @IsString()
  laporanKemajuan: string;

  @ApiProperty()
  @IsString()
  todo: string;

  // TODO file upload

  @ApiProperty({ type: Date })
  @IsDateString()
  bimbinganBerikutnya: string;
}

export class CreateBimbinganResDto {
  message: string;
}
