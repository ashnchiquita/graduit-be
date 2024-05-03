import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import {
  Konfigurasi,
  KonfigurasiKeyEnum,
} from "src/entities/konfigurasi.entity";

export class KonfigurasiArrDto {
  @ApiProperty({ type: [Konfigurasi] })
  @ValidateNested({ each: true })
  @Type(() => Konfigurasi)
  data: Konfigurasi[];
}

export class UpdateKonfigurasiResDto {
  @ApiProperty({ enum: KonfigurasiKeyEnum, isArray: true })
  keys: KonfigurasiKeyEnum[];
}
