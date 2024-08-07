import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "@nestjs/class-validator";
import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PickType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import { BerkasBimbingan } from "src/entities/berkasBimbingan.entity";
import { Bimbingan, BimbinganStatus } from "src/entities/bimbingan.entity";
import {
  JalurEnum,
  PendaftaranTesis,
} from "src/entities/pendaftaranTesis.entity";
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
] as const) {}

export class GetByMahasiswaIdResDto {
  @ApiProperty({ type: [Bimbingan] })
  bimbingan: Bimbingan[];

  @ApiProperty({ type: MhsRes })
  mahasiswa: MhsRes;

  @ApiProperty({ type: PickedTopikBimbingan })
  topik: PickedTopikBimbingan;

  @ApiProperty({ enum: BimbinganStatus })
  status: BimbinganStatus;
}

class BerkasWithoutId extends OmitType(BerkasBimbingan, ["id"] as const) {}

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

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsOptional()
  bimbinganBerikutnya: string;

  @ApiProperty({ type: [BerkasWithoutId] })
  @ValidateNested({ each: true })
  @Type(() => BerkasWithoutId)
  @IsDefined()
  berkas: BerkasWithoutId[];
}

export class CreateBimbinganResDto {
  @ApiProperty()
  id: string;
}

export class ByMhsIdDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  mahasiswaId: string;
}

export class UpdateStatusDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  bimbinganId: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;
}

export class UpdateStatusResDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;
}

export class GetByBimbinganIdResDto extends IntersectionType(
  OmitType(Bimbingan, ["pendaftaran"] as const),
  PickType(PendaftaranTesis, ["jalurPilihan"] as const),
) {}
