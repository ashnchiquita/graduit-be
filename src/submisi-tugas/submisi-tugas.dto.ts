import { IsString } from "@nestjs/class-validator";
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNumberString,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { BerkasSubmisiTugas } from "src/entities/berkasSubmisiTugas.entity";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { SubmisiTugas } from "src/entities/submisiTugas.entity";
import { GetTugasByIdRespDto } from "src/tugas/tugas.dto";

class BerkasSubmisiTugasWithoutId extends OmitType(BerkasSubmisiTugas, [
  "id",
] as const) {}

export class CreateSubmisiTugasDto extends PickType(SubmisiTugas, [
  "jawaban",
  "isSubmitted",
  "tugasId",
]) {
  @ApiProperty({ type: [BerkasSubmisiTugasWithoutId] })
  @ValidateNested({ each: true })
  @Type(() => BerkasSubmisiTugasWithoutId)
  berkasSubmisiTugas: BerkasSubmisiTugasWithoutId[];
}

export class SubmisiTugasIdDto extends PickType(SubmisiTugas, [
  "id",
] as const) {}

export class GetSubmisiTugasByTugasIdQueryDto extends PickType(SubmisiTugas, [
  "tugasId",
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: 1" })
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: "default: 10" })
  limit?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  @ApiPropertyOptional({
    description: "if not specified, will return all submisi tugas",
  })
  isSubmitted?: boolean;

  @ApiPropertyOptional({
    enum: ["ASC", "DESC"],
    description: "order by nim. default: ASC",
  })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  order?: "ASC" | "DESC";
}

class PickedSubmisiTugas extends PickType(SubmisiTugas, [
  "id",
  "isSubmitted",
  "berkasSubmisiTugas",
] as const) {}

class PickedSubmisiTugasExtended extends PickType(SubmisiTugas, [
  "id",
  "isSubmitted",
  "jawaban",
  "submittedAt",
  "berkasSubmisiTugas",
] as const) {}

class PickedPendaftaranTesis extends PickType(PendaftaranTesis, [
  "id",
  "jalurPilihan",
  "waktuPengiriman",
  "jadwalInterview",
  "status",
  "topik",
] as const) {}

class PickedPendaftaran extends PickType(Pengguna, [
  "id",
  "nama",
  "email",
] as const) {
  @ApiProperty({ type: PickedPendaftaranTesis })
  pendaftaranTesis: PickedPendaftaranTesis;
}

export class GetSubmisiTugasByTugasIdRespDto extends PickType(Pengguna, [
  "id",
  "nim",
  "nama",
] as const) {
  @ApiPropertyOptional({ type: PickedSubmisiTugas })
  submisiTugas?: PickedSubmisiTugas;
}

export class GetSubmisiTugasByIdRespDto {
  @ApiProperty({ type: GetTugasByIdRespDto })
  tugas: GetTugasByIdRespDto;

  @ApiPropertyOptional({ type: PickedPendaftaran })
  pendaftaran?: PickedPendaftaran;

  @ApiProperty({ type: PickedSubmisiTugasExtended })
  submisiTugas: PickedSubmisiTugasExtended;
}
