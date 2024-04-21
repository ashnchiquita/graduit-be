import {
  IsEnum,
  IsOptional,
  IsPositive,
  IsUUID,
} from "@nestjs/class-validator";
import {
  ApiProperty,
  PickType,
  PartialType,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import { Kelas } from "src/entities/kelas.entity";
import { MataKuliah } from "src/entities/mataKuliah.entity";
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

export class SearchQueryDto {
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
] as const) {
  @ApiProperty()
  mataKuliahNama: string;
}

export class UserKelasResDto extends PickType(Pengguna, [
  "id",
  "nama",
  "email",
] as const) {
  @ApiProperty({ type: [KelasUser] })
  kelas: KelasUser[];
}
export class GetNextNomorResDto {
  @ApiProperty({ example: 2 })
  nomor: number;
}

class PickedPengajarKelasDto extends PickType(Pengguna, [
  "id",
  "nama",
] as const) {}

class PickedMahasiswaKelasDto extends PickType(Pengguna, [
  "id",
  "nama",
  "nim",
] as const) {}

export class GetKelasDetailRespDto extends PickType(Kelas, ["id"] as const) {
  @ApiProperty({ type: [PickedPengajarKelasDto] })
  pengajar: PickedPengajarKelasDto[];

  @ApiProperty({ type: [PickedMahasiswaKelasDto] })
  mahasiswa: PickedMahasiswaKelasDto[];
}

export class UpdateKelasPenggunaDto extends PickType(AssignKelasDto, [
  "kelasIds" as const,
]) {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  penggunaId: string;
}
