import { IsUUID } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ByIdParamDto {
  @IsUUID()
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;
}
