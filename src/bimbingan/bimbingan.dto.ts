import { Bimbingan } from "src/entities/bimbingan.entity";
import { Pengguna } from "src/entities/pengguna.entity";

export class GetByMahasiswaIdResDto {
  bimbingan: Bimbingan[];
  mahasiswa: Pengguna & { jalurPilihan: string };
}
