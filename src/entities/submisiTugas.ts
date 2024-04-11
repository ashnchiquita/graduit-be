import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { Tugas } from "./tugas.entity";
import { BerkasSubmisiTugas } from "./berkasSubmisiTugas";

@Entity()
export class SubmisiTugas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @Column({ type: "text" })
  jawaban: string;

  @OneToMany(
    () => BerkasSubmisiTugas,
    (berkasSubmisiTugas) => berkasSubmisiTugas.submisiTugas,
  )
  berkasSubmisiTugas: BerkasSubmisiTugas[];

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  submittedAt: Date;

  @ManyToOne(() => Tugas, (tugas) => tugas.id)
  tugas: Tugas;
}
