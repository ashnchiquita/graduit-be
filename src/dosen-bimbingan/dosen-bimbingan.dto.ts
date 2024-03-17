import {
  ArrayMaxSize,
  IsArray,
  IsUUID,
  ArrayMinSize,
  ArrayUnique,
  IsOptional,
} from "@nestjs/class-validator";

export class DosbimOptQueryDto {
  @IsOptional()
  @IsUUID()
  regId?: string;
}

export class DosbimQueryDto {
  @IsUUID()
  regId?: string;
}

export class UpdateDosbimDto {
  @IsArray()
  @IsUUID("all", { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ArrayUnique()
  dosbimIds: string[];
}
