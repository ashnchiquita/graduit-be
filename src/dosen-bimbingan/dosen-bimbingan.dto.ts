import { IsOptional } from "@nestjs/class-validator";
import { ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { Pengguna } from "src/entities/pengguna.entity";

export class DosbimOptQueryDto {
  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  regId?: string;
}

export class GetDosbimResDto extends PickType(Pengguna, [
  "id",
  "email",
  "nama",
] as const) {}
