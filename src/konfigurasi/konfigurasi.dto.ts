import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

export class KonfigurasiDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;
}
export class KonfigurasiArrDto {
  @ApiProperty({ type: [KonfigurasiDto] })
  @ValidateNested({ each: true })
  @Type(() => KonfigurasiDto)
  data: KonfigurasiDto[];
}

export class UpdateKonfigurasiResDto {
  @ApiProperty()
  message: string;
}
