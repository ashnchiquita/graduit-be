import { Bimbingan } from "src/entities/bimbingan.entity";
import { JalurEnum } from "src/entities/pendaftaranTesis.entity";
import { Pengguna } from "src/entities/pengguna.entity";
import { Topik } from "src/entities/topik.entity";

export class GetByMahasiswaIdResDto {
  bimbingan: Bimbingan[];
  mahasiswa: Pengguna & { jalurPilihan: JalurEnum };
  topik: Topik;
}
