import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { BimbinganStatus } from "src/entities/bimbingan.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";
import { JalurEnum } from "../entities/pendaftaranTesis.entity";

class PickedTopikDashboard extends PickType(Topik, ["id", "judul"] as const) {}
class PickedMhsDashboard extends PickType(Pengguna, [
  "id",
  "nama",
  "nim",
  "email",
] as const) {}

class NoEmailUserDashboard extends OmitType(PickedMhsDashboard, [
  "email",
] as const) {}

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
  id_mahasiswa: string;

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

export class GetDashboardMahasiswaRespDto {
  @ApiProperty()
  isSemproPeriod: boolean;

  @ApiProperty()
  isSemtesPeriod: boolean;

  @ApiProperty()
  isSidangPeriod: boolean;
}
