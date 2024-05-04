import { PickType } from "@nestjs/swagger";
import { Pengguna } from "src/entities/pengguna.entity";

export class GetDosujiResDto extends PickType(Pengguna, [
  "id",
  "email",
  "nama",
  "keahlian",
] as const) {}
