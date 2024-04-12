import {
  ArrayMaxSize,
  IsArray,
  IsUUID,
  ArrayMinSize,
  ArrayUnique,
  IsOptional,
} from "@nestjs/class-validator";
import { ApiProperty, ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { Pengguna } from "src/entities/pengguna.entity";

export class DosbimOptQueryDto {
  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  regId?: string;
}

export class DosbimQueryDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  regId: string;
}

export class UpdateDosbimDto {
  @ApiProperty({
    type: [String],
    example: ["550e8400-e29b-41d4-a716-446655440000"],
  })
  @IsArray()
  @IsUUID("all", { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ArrayUnique()
  dosbimIds: string[];
}

export class SuccessResDto {
  @ApiProperty()
  status: string;
}

export class GetDosbimResDto extends PickType(Pengguna, [
  "id",
  "email",
  "nama",
] as const) {}
