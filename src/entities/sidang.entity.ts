import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { RangeJadwalSidang } from "./rangeJadwalSidang.entity";
import { Ruangan } from "./ruangan.entity";
import { PembimbingSidang } from "./pembimbingSidang.entity";
import { PengujiSidang } from "./pengujiSidang.entity";

@Entity()
export class Sidang {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  periode: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @ManyToOne(
    () => RangeJadwalSidang,
    (rangeJadwalSidang) => rangeJadwalSidang.id,
  )
  rangeJadwal: RangeJadwalSidang;

  @ManyToOne(() => Ruangan, (ruangan) => ruangan.id)
  ruangan: Ruangan;

  @OneToMany(
    () => PembimbingSidang,
    (pembimbingSidang) => pembimbingSidang.sidang,
  )
  pembimbingSidang: PembimbingSidang[];

  @OneToMany(() => PengujiSidang, (pengujiSidang) => pengujiSidang.sidang)
  pengujiSidang: PengujiSidang[];
}
