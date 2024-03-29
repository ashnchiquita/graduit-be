import { JalurEnum } from "../entities/pendaftaranTesis.entity";

export class DashboardDto {
  id: string;
  jalurPilihan: JalurEnum;
  status: string;
  topik: {
    id: string;
    judul: string;
  };
  mahasiswa: {
    id: string;
    nama: string;
    nim: string;
  };
}
