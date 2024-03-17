import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
} from "@nestjs/class-validator";

export class CreateTopikDto {
  @IsNotEmpty()
  judul: string;

  @IsNotEmpty()
  deskripsi: string;

  @IsUUID()
  idPengaju: string;
}

export class UpdateTopikDto extends CreateTopikDto {}

export class TopikParamDto {
  @IsUUID()
  id: string;
}

export class TopikQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  idPembimbing?: string;
}
