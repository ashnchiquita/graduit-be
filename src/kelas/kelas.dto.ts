import { IsEnum, IsOptional, IsPositive } from "@nestjs/class-validator";
import {
  ApiProperty,
  PickType,
  PartialType,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import { Kelas } from "src/entities/kelas.entity";
import { MataKuliah } from "src/entities/mataKuliah";
import { RoleEnum } from "src/entities/pengguna.entity";

export class CreateKelasDto extends PickType(Kelas, [
  "mataKuliahKode",
] as const) {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsPositive()
  nomor: number;
}

export class UpdateKelasDto extends PartialType(Kelas) {}

export class IdKelasResDto extends PickType(Kelas, ["id"] as const) {}

export class DeleteKelasDto extends PickType(Kelas, [
  "mataKuliahKode",
  "nomor",
] as const) {}

export class GetKelasQueryDto {
  @IsEnum([RoleEnum.S2_KULIAH, RoleEnum.S2_MAHASISWA, RoleEnum.S2_TIM_TESIS])
  @ApiProperty({
    enum: [RoleEnum.S2_KULIAH, RoleEnum.S2_MAHASISWA, RoleEnum.S2_TIM_TESIS],
  })
  view: RoleEnum.S2_KULIAH | RoleEnum.S2_MAHASISWA | RoleEnum.S2_TIM_TESIS;

  @ApiPropertyOptional({ example: "IF3270" })
  @IsOptional()
  kodeMatkul: string;

  @ApiPropertyOptional({ example: "Intelegensi Buatan" })
  @IsOptional()
  search: string;
}

export class ByIdKelasDto extends PickType(Kelas, ["id"] as const) {}

export class GetKelasRespDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: "K02" })
  nomor: string;

  @ApiProperty({ example: "IF3270" })
  kode_mata_kuliah: string;

  @ApiProperty({ example: "Pengembangan Aplikasi Terdistribusi" })
  nama_mata_kuliah: string;

  @ApiProperty()
  jumlah_mahasiswa: number;

  @ApiProperty({ example: "bg-blue-600/20" })
  warna: string;
}

export class KodeRespDto extends PickType(MataKuliah, ["kode"] as const) {}

export class GetNextNomorResDto {
  @ApiProperty({ example: 2 })
  nomor: number;
}
