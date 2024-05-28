import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { BerkasSidsem } from "src/entities/berkasSidsem.entity";
import {
  PendaftaranSidsem,
  SidsemStatus,
  TipeSidsemEnum,
} from "src/entities/pendaftaranSidsem";
import { JalurEnum } from "src/entities/pendaftaranTesis.entity";
import { RoleEnum } from "src/entities/pengguna.entity";

export class SidsemViewQueryDto {
  @IsEnum([
    RoleEnum.S2_PEMBIMBING,
    RoleEnum.ADMIN,
    RoleEnum.S2_TIM_TESIS,
    RoleEnum.S2_PENGUJI,
  ])
  @ApiProperty({
    enum: [
      RoleEnum.S2_PEMBIMBING,
      RoleEnum.ADMIN,
      RoleEnum.S2_TIM_TESIS,
      RoleEnum.S2_PENGUJI,
    ],
  })
  view:
    | RoleEnum.S2_PEMBIMBING
    | RoleEnum.ADMIN
    | RoleEnum.S2_TIM_TESIS
    | RoleEnum.S2_PENGUJI;
}

export class GetAllPengajuanSidangReqQueryDto extends SidsemViewQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: TipeSidsemEnum })
  @IsEnum(TipeSidsemEnum)
  @IsOptional()
  jenisSidang?: TipeSidsemEnum;

  @ApiPropertyOptional({ enum: SidsemStatus })
  @IsEnum(SidsemStatus)
  @IsOptional()
  status?: SidsemStatus;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: 1" })
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: no limit" })
  limit?: number;
}

class NameAndId {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nama: string;
}

export class GetAllPengajuanSidangItemDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  idPengajuanSidsem: string;

  @ApiProperty()
  idMahasiswa: string;

  @ApiProperty()
  nimMahasiswa: string;

  @ApiProperty()
  namaMahasiswa: string;

  @ApiProperty({ nullable: true })
  jadwalSidang: string | null;

  @ApiProperty({ enum: TipeSidsemEnum })
  jenisSidang: TipeSidsemEnum;

  @ApiProperty({ nullable: true })
  ruangan: string | null;

  @ApiProperty({ enum: SidsemStatus })
  status: SidsemStatus;

  @ApiProperty({ type: [NameAndId] })
  dosenPembimbing: NameAndId[];

  @ApiProperty({ type: [BerkasSidsem] })
  berkasSidsem: BerkasSidsem[];
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
  @ApiProperty({ type: [NameAndId] })
  dosenPembimbing: NameAndId[];
  @ApiProperty({ type: [NameAndId] })
  dosenPenguji: NameAndId[];

  @ApiProperty()
  judulSidsem: string;

  @ApiProperty()
  deskripsiSidsem: string;
}

class BerkasSidsemWithoutId extends OmitType(BerkasSidsem, ["id"] as const) {}

export class CreatePengajuanSidsemDto extends PickType(PendaftaranSidsem, [
  "judulSidsem",
  "deskripsiSidsem",
  "tipe",
]) {
  @ApiProperty({ type: [BerkasSidsemWithoutId] })
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => BerkasSidsemWithoutId)
  berkasSidsem: BerkasSidsemWithoutId[];
}

export class PengajuanSidsemIdDto extends PickType(PendaftaranSidsem, [
  "id",
] as const) {}

export class UpdateSidsemDetailDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruangan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  jadwal?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID("all", { each: true })
  dosenPengujiIds?: string[];
}

export class SidsemMhsIdParamDto {
  @IsUUID()
  @ApiProperty()
  mhsId: string;
}

export class UpdateSidsemStatusDto {
  @IsEnum([SidsemStatus.APPROVED, SidsemStatus.REJECTED])
  @ApiProperty({ enum: [SidsemStatus.APPROVED, SidsemStatus.REJECTED] })
  status: SidsemStatus.APPROVED | SidsemStatus.REJECTED;
}
