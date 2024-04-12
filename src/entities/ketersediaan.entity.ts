import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class Ketersediaan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  tanggal: string;

  @Column({ type: "bit", length: 20 })
  slot: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: Pengguna;
}
