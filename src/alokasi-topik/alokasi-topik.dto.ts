import { PartialType } from "@nestjs/mapped-types";

export class CreateTopikDto {
  judul: string;
  deskripsi: string;
  idPengaju: string;
}

export class UpdateTopikDto extends PartialType(CreateTopikDto) {}
