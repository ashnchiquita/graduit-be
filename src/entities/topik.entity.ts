import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
  pengaju: Pengguna;
}
