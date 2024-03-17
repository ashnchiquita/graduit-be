import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { PendaftaranTesis } from "./pendaftaranTesis.entity";

@Entity()
export class DosenBimbingan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  @JoinColumn({ name: "idPendaftaran" })
  pendaftaran: PendaftaranTesis;

  @Column({ nullable: true })
  idPendaftaran: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "idDosen" })
  dosen: Pengguna;

  @Column({ nullable: true })
  idDosen: string;
}
