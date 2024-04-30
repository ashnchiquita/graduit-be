import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { Bimbingan, BimbinganStatus } from "src/entities/bimbingan.entity";
import { PendaftaranSidsem } from "src/entities/pendaftaranSidsem";
import { Pengguna } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";
import {
  JalurEnum,
  PendaftaranTesis,
} from "../entities/pendaftaranTesis.entity";

class PickedTopikDashboard extends PickType(Topik, ["id", "judul"] as const) {}
class PickedMhsDashboard extends PickType(Pengguna, [
  "id",
  "nama",
  "nim",
  "email",
] as const) {}

class OmittedTopikMhsDashboard extends OmitType(Topik, ["pengaju"] as const) {}

class NoEmailUserDashboard extends OmitType(PickedMhsDashboard, [
  "email",
] as const) {}

export class NoNIMUserDashboard extends OmitType(PickedMhsDashboard, [
  "nim",
] as const) {}

class OmittedPendaftaranTesisMhsDashboard extends OmitType(PendaftaranTesis, [
  "mahasiswa",
  "topik",
  "penerima",
] as const) {
  @ApiProperty()
  topik: OmittedTopikMhsDashboard;

  @ApiProperty()
  penerima: NoEmailUserDashboard;
}

class SidsemWithPenguji extends OmitType(PendaftaranSidsem, [
  "penguji",
] as const) {
  @ApiProperty({ type: [NoNIMUserDashboard] })
  penguji: NoNIMUserDashboard[];
}

export class DashboardDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ enum: JalurEnum })
  jalurPilihan: JalurEnum;

  @ApiProperty({ enum: BimbinganStatus })
  status: BimbinganStatus;

  @ApiProperty()
  topik: PickedTopikDashboard;

  @ApiProperty()
  mahasiswa: NoEmailUserDashboard;
}

export class JalurStatisticDto {
  @ApiProperty({ enum: JalurEnum })
  jalurPilihan: JalurEnum;

  @ApiProperty()
  count: number;
}

export class DashboardMahasiswaResDto {
  @ApiProperty()
  mahasiswa: PickedMhsDashboard;

  @ApiProperty({ type: OmittedPendaftaranTesisMhsDashboard, nullable: true })
  pendaftaranTesis: OmittedPendaftaranTesisMhsDashboard;

  @ApiProperty({ type: [NoNIMUserDashboard] })
  dosenBimbingan: NoNIMUserDashboard[];

  @ApiProperty({ type: [Bimbingan] })
  bimbingan: Bimbingan[];

  @ApiProperty({
    type: PendaftaranSidsem,
    nullable: true,
  })
  seminarSatu: PendaftaranSidsem;

  @ApiProperty({
    type: SidsemWithPenguji,
    nullable: true,
  })
  seminarDua: SidsemWithPenguji;

  @ApiProperty({
    type: SidsemWithPenguji,
    nullable: true,
  })
  sidang: SidsemWithPenguji;
}

export class GetDashboardDosbimQueryDto {
  @ApiPropertyOptional({})
  @IsOptional()
  search: string;
}

export class GetDashboardTimTesisReqQueryDto {
  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: 1" })
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: no limit" })
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  search?: string;
}

export enum DashboardTimTesisStatusEnum {
  PENGAJUAN_TOPIK = "PENGAJUAN_TOPIK",
  SEMINAR_1 = "SEMINAR_1",
  SEMINAR_2 = "SEMINAR_2",
  SIDANG = "SIDANG",
}

class GetDashboardTimTesisDataDto {
  @ApiProperty()
  nim_mahasiswa: string;

  @ApiProperty()
  nama_mahasiswa: string;

  @ApiProperty({ isArray: true })
  dosen_pembimbing: string[];

  @ApiProperty({ isArray: true, enum: DashboardTimTesisStatusEnum })
  status: DashboardTimTesisStatusEnum[];
}

export class GetDashboardTimTesisRespDto {
  @ApiProperty()
  maxPage: number;

  @ApiProperty({ type: GetDashboardTimTesisDataDto })
  data: GetDashboardTimTesisDataDto[];
}
