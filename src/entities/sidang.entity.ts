import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { RangeJadwalSidang } from "./rangeJadwalSidang.entity";
import { Ruangan } from "./ruangan.entity";

@Entity()
export class Sidang {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @ManyToOne(
    () => RangeJadwalSidang,
    (rangeJadwalSidang) => rangeJadwalSidang.id,
  )
  rangeJadwal: RangeJadwalSidang;

  @ManyToOne(() => Ruangan, (ruangan) => ruangan.id)
  ruangan: Ruangan;
}
