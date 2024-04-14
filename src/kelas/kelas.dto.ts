import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsPositive,
} from "@nestjs/class-validator";
import {
  ApiProperty,
  PickType,
  PartialType,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import { Kelas } from "src/entities/kelas.entity";
import { MataKuliah } from "src/entities/mataKuliah";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";

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

export class GetNextNomorResDto {
  @ApiProperty({ example: 2 })
  nomor: number;
}

export class AssignKelasDto {
  @ApiProperty()
  @IsUUID("all", { each: true })
  kelasIds: string[];

  @ApiProperty()
  @IsUUID("all", { each: true })
  penggunaIds: string[];
}

export class UnassignKelasDto extends PickType(AssignKelasDto, [
  "penggunaIds",
] as const) {}

export class MessageResDto {
  @ApiProperty()
  message: string;
}

class KelasUser extends PickType(Kelas, [
  "id",
  "nomor",
  "mataKuliahKode",
] as const) {}

export class UserKelasResDto extends PickType(Pengguna, [
  "id",
  "nama",
  "email",
] as const) {
  @ApiProperty({ type: [KelasUser] })
  kelas: KelasUser[];
}
