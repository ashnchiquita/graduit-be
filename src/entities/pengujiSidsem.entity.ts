import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { PendaftaranSidsem } from "./pendaftaranSidsem";

@Entity()
export class PengujiSidsem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(
    () => PendaftaranSidsem,
    (pendaftaranSidsem) => pendaftaranSidsem.id,
  )
  @JoinColumn({ name: "idSidsem" })
  sidsem: PendaftaranSidsem;

  @Column()
  idSidsem: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "idDosen" })
  dosen: Pengguna;

  @Column()
  idDosen: string;
}
