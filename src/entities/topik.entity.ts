import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class Topik {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  judul: string;

  @Column({ type: "text" })
  deskripsi: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "idPengaju" })
  pengaju: Pengguna;

  @Column({ nullable: true })
  idPengaju: string;

  @Column({ type: "text" })
  periode: string;
}
