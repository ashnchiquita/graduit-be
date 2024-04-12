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

export class DashboardMahasiswaResDto {
  // @ApiProperty()
  // mahasiswa: {
  //   id: string;
  //   nama: string;
  //   nim: string;
  //   email: string;
  // };
  // @ApiProperty()
  // pendaftaran: {
  //   id: string;
  //   jalurPilihan: JalurEnum;
  //   status: RegStatus;
  //   waktuPengiriman: Date;
  //   jadwalInterview: Date;
  //   waktuKeputusan: Date;
  //   topik: Topik;
  //   penerima: {
  //     id: string;
  //     nama: string;
  //     email: string;
  //   };
  // };
}
