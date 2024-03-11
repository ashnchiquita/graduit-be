import { JalurEnum } from "src/entities/pengajuanPengambilanTopik.entity";

export class RegistrasiTopikDto {
  idMahasiswa: string;
  idPembimbing: string;
  judulTopik: string;
  deskripsi: string;
  jalurPilihan: JalurEnum;
}