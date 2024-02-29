import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { RangeJadwalSidang } from "./rangeJadwalSidang.entity";
import { Ruangan } from "./ruangan.entity";

@Entity()
export class Sidang {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: string;

  @ManyToOne(
    () => RangeJadwalSidang,
    (rangeJadwalSidang) => rangeJadwalSidang.id,
  )
  rangeJadwal: string;

  @ManyToOne(() => Ruangan, (ruangan) => ruangan.id)
  ruangan: string;
}
