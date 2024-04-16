import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsUUID, ValidateNested } from "class-validator";
import { BerkasTugas } from "src/entities/berkasTugas";
import { Pengguna } from "src/entities/pengguna.entity";
import { Tugas } from "src/entities/tugas.entity";

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

export class TugasIdDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  id: string;
}

class PickedPengajarKelas extends PickType(Pengguna, ["id", "nama"] as const) {}

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
}
