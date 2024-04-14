import { IsUUID } from "@nestjs/class-validator";
import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Kelas } from "src/entities/kelas.entity";
import { MataKuliah } from "src/entities/mataKuliah";
import { Pengguna, RoleEnum } from "src/entities/pengguna.entity";

export class CreateKelasDto extends PickType(Kelas, [
  "mataKuliahKode",
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
