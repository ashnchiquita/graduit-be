import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

export enum KonfigurasiKeyEnum {
  AWAL_PENDAFTARAN = "AWAL_PENDAFTARAN",
  AKHIR_PENDAFTARAN = "AKHIR_PENDAFTARAN",
  AWAL_SEMPRO = "AWAL_SEMPRO",
  AKHIR_SEMPRO = "AKHIR_SEMPRO",
  AWAL_SEM_TESIS = "AWAL_SEM_TESIS",
  AKHIR_SEM_TESIS = "AKHIR_SEM_TESIS",
  AWAL_SIDANG = "AWAL_SIDANG",
  AKHIR_SIDANG = "AKHIR_SIDANG",
}

@Entity()
export class Konfigurasi {
  @ApiProperty({ enum: KonfigurasiKeyEnum })
  @IsEnum(KonfigurasiKeyEnum)
  @PrimaryColumn({ type: "enum", enum: KonfigurasiKeyEnum })
  key: KonfigurasiKeyEnum;

  @ApiProperty()
  @IsString()
  @Column({ type: "text" })
  value: string;
}
