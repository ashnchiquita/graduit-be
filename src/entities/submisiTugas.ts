import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { Tugas } from "./tugas.entity";

@Entity()
export class SubmisiTugas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @Column({ type: "text" })
  jawaban: string;

  @Column({
    type: "text",
    array: true,
    default: [],
  })
  berkas: string[];

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  submittedAt: Date;

  @ManyToOne(() => Tugas, (tugas) => tugas.id)
  tugas: Tugas;
}
