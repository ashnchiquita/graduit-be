import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsOptional, IsString } from "class-validator";
import { TipeSidsemEnum } from "src/entities/pendaftaranSidsem";
import { JalurEnum } from "src/entities/pendaftaranTesis.entity";

export class GetAllPengajuanSidangReqQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: TipeSidsemEnum })
  @IsEnum(TipeSidsemEnum)
  @IsOptional()
  jenisSidang?: TipeSidsemEnum;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: 1" })
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: no limit" })
  limit?: number;
}

export class GetAllPengajuanSidangItemDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  idPengajuanSidsem: string;

  @ApiProperty()
  nimMahasiswa: string;

  @ApiProperty()
  namaMahasiswa: string;

  @ApiProperty()
  jadwalSidang: string;

  @ApiProperty({ enum: TipeSidsemEnum })
  jenisSidang: TipeSidsemEnum;

  @ApiProperty({ nullable: true })
  ruangan: string | null;
}

export class GetAllPengajuanSidangRespDto {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: GetAllPengajuanSidangItemDto, isArray: true })
  data: GetAllPengajuanSidangItemDto[];
}

export class GetOnePengajuanSidangRespDto extends GetAllPengajuanSidangItemDto {
  @ApiProperty()
  emailMahasiswa: string;
  @ApiProperty({ enum: JalurEnum })
  jalurPilihan: JalurEnum;
  @ApiProperty()
  judulTopik: string;
  @ApiProperty()
  deskripsiTopik: string;
  @ApiProperty({ isArray: true })
  dosenPembimbing: string[];
  @ApiProperty({ isArray: true })
  dosenPenguji: string[];
}

export class UpdateAlokasiRuanganReqDto {
  @ApiProperty()
  @IsString()
  ruangan: string;
}

export class UpdateAlokasiRuanganRespDto extends GetAllPengajuanSidangItemDto {}
