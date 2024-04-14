import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from "@nestjs/class-validator";
import { ApiProperty, ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { ArrayMinSize, ArrayUnique, IsArray } from "class-validator";
import {
  JalurEnum,
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";

export class RegDto {
  @IsUUID()
  @ApiProperty()
  idMahasiswa: string;

  @IsUUID()
  @ApiProperty()
  idPenerima: string;

  @IsString()
  @ApiProperty()
  judulTopik: string;

  @IsString()
  @ApiProperty()
  deskripsi: string;

  @IsEnum(JalurEnum)
  @ApiProperty({ enum: JalurEnum })
  jalurPilihan: JalurEnum;
}

export class RegByMhsParamDto {
  @IsUUID()
  @ApiProperty()
  mahasiswaId: string;
}

export class IdDto {
  @IsUUID()
  @ApiProperty()
  id: string;
}

export class ViewQueryDto {
  @IsEnum([RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS])
  @ApiProperty({
    enum: [RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS],
  })
  view: RoleEnum.S2_PEMBIMBING | RoleEnum.ADMIN | RoleEnum.S2_TIM_TESIS;
}

export class RegQueryDto extends ViewQueryDto {
  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional()
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @IsEnum(RegStatus)
  @ApiPropertyOptional({ enum: RegStatus })
  status?: RegStatus;

  @IsOptional()
  @IsEnum(["nim"])
  @ApiPropertyOptional({ enum: ["nim"] })
  order_by?: "nim";

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  @ApiPropertyOptional({ enum: ["ASC", "DESC"] })
  sort?: "ASC" | "DESC";
}

export class FindAllNewestRegRespDataDto {
  @ApiProperty()
  pendaftaran_id: string;

  @ApiProperty()
  nim: string;

  @ApiProperty()
  mahasiswa_nama: string;

  @ApiProperty()
  mahasiswa_id: string;

  @ApiProperty()
  pembimbing_nama: string;

  @ApiProperty()
  status: string;
}

export class FindAllNewestRegRespDto {
  @ApiProperty({ type: [FindAllNewestRegRespDataDto] })
  data: FindAllNewestRegRespDataDto[];

  @ApiProperty()
  count: number;
}

export class RegStatisticsRespDataDto {
  @ApiProperty()
  amount: number;
  @ApiProperty()
  percentage: number;
}

export class RegStatisticsRespDto {
  @ApiProperty({ type: RegStatisticsRespDataDto })
  diterima: RegStatisticsRespDataDto;

  @ApiProperty({ type: RegStatisticsRespDataDto })
  sedang_proses: RegStatisticsRespDataDto;

  @ApiProperty({ type: RegStatisticsRespDataDto })
  ditolak: RegStatisticsRespDataDto;
}

export class UpdateByMhsParamsDto {
  @IsUUID()
  @ApiProperty()
  mhsId: string;
}

export class UpdateInterviewBodyDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  date: string;
}

export class UpdateStatusBodyDto {
  @ApiProperty({ enum: [RegStatus.APPROVED, RegStatus.REJECTED] })
  @IsEnum([RegStatus.APPROVED, RegStatus.REJECTED])
  status: RegStatus;
}

export class UpdatePembimbingBodyDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID("all", { each: true })
  @ArrayMinSize(1)
  @ArrayUnique()
  pembimbing_ids: string[];
}

class DosenPembimbingDto extends PickType(Pengguna, [
  "id",
  "nama",
  "kontak",
] as const) {}

export class GetByIdRespDto extends PickType(PendaftaranTesis, [
  "id",
  "jadwalInterview",
  "status",
  "jalurPilihan",
  "waktuPengiriman",
] as const) {
  @ApiProperty()
  judulTopik: string;

  @ApiProperty()
  deskripsiTopik: string;

  @ApiProperty({ type: [DosenPembimbingDto] })
  dosenPembimbing: DosenPembimbingDto[];
}
