import { IsNumberString } from "@nestjs/class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class GetNilaiByMatkulQueryDto {
  @ApiPropertyOptional({ example: "IF4031" })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  kode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: 1" })
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: 10" })
  limit?: number;
}

export class GetNilaiByMatkulRespDto {
  @ApiProperty({ example: "IF4031" })
  mata_kuliah_kode: string;

  @ApiProperty({ example: "Pemrograman Berbasis Kerangka Kerja" })
  mata_kuliah_nama: string;

  @ApiProperty()
  kelas_nomor: number;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  mahasiswa_kelas_id: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  mahasiswa_id: string;

  @ApiProperty()
  mahasiswa_nama: string;

  @ApiProperty({ example: "13517000" })
  mahasiswa_nim: string;

  @ApiProperty()
  nilai_akhir: string | null;
}

export class UpdateNilaiRespDto {
  @ApiProperty({
    type: [String],
    example: ["550e8400-e29b-41d4-a716-446655440000"],
  })
  @IsUUID("all", { each: true })
  mahasiswaKelasIds: string[];
}

export class UpdateNilaiDto extends UpdateNilaiRespDto {
  @ApiPropertyOptional({ description: "undefined: assign nilai to null" })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  nilaiAkhir?: number;
}
