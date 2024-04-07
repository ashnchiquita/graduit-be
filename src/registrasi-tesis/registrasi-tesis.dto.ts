import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from "@nestjs/class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class UpdateInterviewParamsDto {
  @IsUUID()
  @ApiProperty()
  mhsId: string;
}

export class UpdateInterviewBodyDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  date: string;
}
