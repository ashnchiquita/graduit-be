import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { RangeJadwalSeminar } from "./rangeJadwalSeminar.entity";
import { Ruangan } from "./ruangan.entity";
import { PembimbingSeminar } from "./pembimbingSeminar.entity";

@Entity()
export class Seminar {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  periode: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @ManyToOne(
    () => RangeJadwalSeminar,
    (rangeJadwalSeminar) => rangeJadwalSeminar.id,
  )
  rangeJadwal: RangeJadwalSeminar;

  @ManyToOne(() => Ruangan, (ruangan) => ruangan.id)
  ruangan: Ruangan;

  @OneToMany(
    () => PembimbingSeminar,
    (pembimbingSeminar) => pembimbingSeminar.seminar,
  )
  pembimbingSeminar: PembimbingSeminar[];
}
