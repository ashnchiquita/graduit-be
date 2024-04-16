import { ApiProperty, ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { JalurEnum } from "../entities/pendaftaranTesis.entity";
import { Topik } from "src/entities/topik.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { IsOptional } from "class-validator";
import { BimbinganStatus } from "src/entities/bimbingan.entity";

class PickedTopikDashboard extends PickType(Topik, ["id", "judul"] as const) {}
class PickedMhsDashboard extends PickType(Pengguna, [
  "id",
  "nama",
  "nim",
] as const) {}

export class DashboardDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ enum: JalurEnum })
  jalurPilihan: JalurEnum;

  @ApiProperty({ enum: BimbinganStatus })
  status: BimbinganStatus;

  @ApiProperty()
  topik: PickedTopikDashboard;

  @ApiProperty()
  mahasiswa: PickedMhsDashboard;
}

export class JalurStatisticDto {
  @ApiProperty({ enum: JalurEnum })
  jalurPilihan: JalurEnum;

  @ApiProperty()
  count: number;
}

export class GetDashboardDosbimQueryDto {
  @ApiPropertyOptional({})
  @IsOptional()
  search: string;
}
