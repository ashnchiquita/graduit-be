import { IsDateString, IsString } from "@nestjs/class-validator";
import { ApiProperty, PickType } from "@nestjs/swagger";
import { Bimbingan } from "src/entities/bimbingan.entity";
import { JalurEnum } from "src/entities/pendaftaranTesis.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";

class MhsRes extends PickType(Pengguna, ["id", "nama", "email"] as const) {
  @ApiProperty({ enum: JalurEnum })
  jalurPilihan: JalurEnum;
}

class PickedTopikBimbingan extends PickType(Topik, [
  "id",
  "judul",
  "deskripsi",
  "idPengaju",
  "periode",
] as const) {}

export class GetByMahasiswaIdResDto {
  @ApiProperty({ type: [Bimbingan] })
  bimbingan: Bimbingan[];

  @ApiProperty({ type: MhsRes })
  mahasiswa: MhsRes;

  @ApiProperty({ type: PickedTopikBimbingan })
  topik: PickedTopikBimbingan;
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
  @ApiProperty()
  message: string;
}

export class ByMhsIdDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  mahasiswaId: string;
}
