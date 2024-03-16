import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from "@nestjs/class-validator";
import { JalurEnum, RegStatus } from "src/entities/pendaftaranTesis.entity";
import { RoleEnum } from "src/entities/pengguna.entity";

export class RegDto {
  idMahasiswa: string;
  idPenerima: string;
  judulTopik: string;
  deskripsi: string;
  jalurPilihan: JalurEnum;
}

export class RegByMhsParamDto {
  @IsUUID()
  mahasiswaId: string;
}

export class RegParamDto {
  @IsUUID()
  id: string;
}

export class RegQueryDto {
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
  @IsEnum(RegStatus)
  status?: RegStatus;

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sort?: "ASC" | "DESC";

  @IsEnum([RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS])
  view: RoleEnum.S2_PEMBIMBING | RoleEnum.ADMIN | RoleEnum.S2_TIM_TESIS;
}

export class ViewQueryDto {
  @IsEnum([RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS])
  view: RoleEnum.S2_PEMBIMBING | RoleEnum.ADMIN | RoleEnum.S2_TIM_TESIS;
}
