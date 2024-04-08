import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from "@nestjs/class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, ArrayUnique, IsArray } from "class-validator";
import { JalurEnum, RegStatus } from "src/entities/pendaftaranTesis.entity";
import { RoleEnum } from "src/entities/pengguna.entity";

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

export class RegParamDto {
  @IsUUID()
  @ApiProperty()
  id: string;
}

export class RegQueryDto {
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
  @ApiPropertyOptional()
  status?: RegStatus;

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  @ApiPropertyOptional()
  sort?: "ASC" | "DESC";

  @IsEnum([RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS])
  @ApiProperty({
    enum: [RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS],
  })
  view: RoleEnum.S2_PEMBIMBING | RoleEnum.ADMIN | RoleEnum.S2_TIM_TESIS;
}

export class ViewQueryDto {
  @IsEnum([RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS])
  @ApiProperty({
    enum: [RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS],
  })
  view: RoleEnum.S2_PEMBIMBING | RoleEnum.ADMIN | RoleEnum.S2_TIM_TESIS;
}

export class FindAllNewestRegRespDataDto {
  @ApiProperty()
  nim: string;
  @ApiProperty()
  mahasiswa_nama: string;
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
  @ApiProperty({ type: FindAllNewestRegRespDataDto })
  diterima: RegStatisticsRespDataDto;

  @ApiProperty({ type: FindAllNewestRegRespDataDto })
  sedang_proses: RegStatisticsRespDataDto;

  @ApiProperty({ type: FindAllNewestRegRespDataDto })
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
  @ApiProperty({ enum: RegStatus })
  @IsEnum(RegStatus)
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
