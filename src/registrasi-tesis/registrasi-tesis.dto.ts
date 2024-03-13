import { JalurEnum } from "src/entities/pendaftaranTesis.entity";

export class RegistrasiTopikDto {
  idMahasiswa: string;
  idPenerima: string;
  judulTopik: string;
  deskripsi: string;
  jalurPilihan: JalurEnum;
}
