import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tugas } from "./tugas.entity";

@Entity()
export class BerkasTugas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Tugas, (tugas) => tugas.id)
  tugas: Tugas;

  @Column({ type: "text" })
  nama: string;

  @Column({ type: "text" })
  url: string;
}
