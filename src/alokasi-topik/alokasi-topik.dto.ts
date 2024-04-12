import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumberString,
} from "@nestjs/class-validator";
import { ApiProperty, ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { Pengguna } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";

export class CreateTopikDto {
  @ApiProperty()
  @IsString()
  judul: string;

  @ApiProperty()
  @IsString()
  deskripsi: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  idPengaju: string;
}

export class UpdateTopikDto extends CreateTopikDto {}

export class TopikParamDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  id: string;
}

export class TopikQueryDto {
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

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  idPembimbing?: string;
}

export class PengajuDto extends OmitType(Pengguna, ["nim"] as const) {}

export class OmittedTopik extends OmitType(Topik, ["idPengaju"] as const) {
  @ApiProperty({ type: PengajuDto })
  pengaju: Pengguna;
}

export class GetAllRespDto {
  @ApiProperty({ type: [OmittedTopik] })
  data: OmittedTopik[];

  @ApiProperty()
  maxPage: number;
}
