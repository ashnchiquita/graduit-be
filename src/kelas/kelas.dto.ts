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
}

export class GetListKelasRespDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: "K02" })
  nomor: string;

  @ApiProperty({ example: "IF4031 Pengembangan Aplikasi Terdistribusi" })
  mata_kuliah: string;

  @ApiProperty()
  jumlah_mahasiswa: number;
}

export class KodeRespDto extends PickType(MataKuliah, ["kode"] as const) {}
