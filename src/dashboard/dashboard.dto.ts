import { ApiProperty, PickType } from "@nestjs/swagger";
import { JalurEnum } from "../entities/pendaftaranTesis.entity";
import { Topik } from "src/entities/topik.entity";
import { Pengguna } from "src/entities/pengguna.entity";

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

  @ApiProperty()
  status: string;

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
