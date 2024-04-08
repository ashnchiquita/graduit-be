import { plainToInstance } from "class-transformer";
import {
  IsNumber,
  validateSync,
  Min,
  Max,
  IsString,
  IsUrl,
} from "class-validator";

class EnvironmentVariables {
  @IsString()
  POSTGRES_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  POSTGRES_PORT: number;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DATABASE: string;

  @IsString()
  @IsUrl({ require_tld: false })
  AUTH_SERVICE_URL: string;

  @IsString()
  @IsUrl({ require_tld: false })
  FE_URL: string;

  @IsString()
  KONF_PERIODE_KEY: string;

  @IsString()
  KONF_MIN_BIMBINGAN_KEY: string;

  @IsString()
  KONF_AWAL_PENDAFTARAN_KEY: string;

  @IsString()
  KONF_AKHIR_PENDAFTARAN_KEY: string;

  @IsString()
  KONF_AWAL_SEMPRO_KEY: string;

  @IsString()
  KONF_AKHIR_SEMPRO_KEY: string;

  @IsString()
  KONF_AWAL_SEM_TESIS_KEY: string;

  @IsString()
  KONF_AKHIR_SEM_TESIS_KEY: string;

  @IsString()
  KONF_AWAL_SIDANG_KEY: string;

  @IsString()
  KONF_AKHIR_SIDANG_KEY: string;

  @IsString()
  COOKIE_NAME: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
