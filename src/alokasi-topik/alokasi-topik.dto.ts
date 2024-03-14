export class CreateTopikDto {
  judul: string;
  deskripsi: string;
  idPengaju: string;
}

export class UpdateTopikDto extends CreateTopikDto {}
