import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { BerkasTugas } from "src/entities/berkasTugas.entity";
import { Kelas } from "src/entities/kelas.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { Tugas } from "src/entities/tugas.entity";
import { GetKelasRespDto } from "src/kelas/kelas.dto";

class BerkasTugasWithoutId extends OmitType(BerkasTugas, ["id"] as const) {}

export class CreateTugasDto extends PickType(Tugas, [
  "judul",
  "waktuMulai",
  "waktuSelesai",
  "deskripsi",
  "kelasId",
]) {
  @ApiProperty({ type: [BerkasTugasWithoutId] })
  @ValidateNested({ each: true })
  @Type(() => BerkasTugasWithoutId)
  berkasTugas: BerkasTugasWithoutId[];
}

export class UpdateTugasDto extends OmitType(CreateTugasDto, [
  "kelasId",
] as const) {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  id: string;
}

export class TugasIdDto extends PickType(Tugas, ["id"] as const) {}

class PickedPengajarKelas extends PickType(Pengguna, ["id", "nama"] as const) {}

class PickedTugasKelas extends PickType(Kelas, [
  "id",
  "nomor",
  "mataKuliah",
] as const) {}

export class GetTugasByIdRespDto extends PickType(Tugas, [
  "id",
  "judul",
  "waktuMulai",
  "waktuSelesai",
  "deskripsi",
  "createdAt",
  "updatedAt",
  "berkasTugas",
] as const) {
  @ApiProperty({ type: PickedPengajarKelas })
  pembuat: PickedPengajarKelas;

  @ApiProperty({ type: PickedPengajarKelas })
  pengubah: PickedPengajarKelas;

  @ApiProperty({ type: PickedTugasKelas })
  kelas: PickedTugasKelas;
}

export class GetTugasByKelasIdQueryDto extends PickType(Tugas, [
  "kelasId",
] as const) {
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetTugasSummaryRespDto extends PickType(Tugas, [
  "id",
  "judul",
  "waktuMulai",
  "waktuSelesai",
] as const) {
  @ApiProperty()
  totalSubmisi: number;
}

export class GetTugasByKelasIdRespDto {
  @ApiProperty({ type: [GetTugasSummaryRespDto] })
  tugas: GetTugasSummaryRespDto[];

  @ApiProperty({ type: GetKelasRespDto })
  kelas: GetKelasRespDto;
}
