import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { PendaftaranTesis } from "./pendaftaranTesis.entity";

@Entity()
export class DosenBimbingan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  pendaftaran: PendaftaranTesis;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: Pengguna;
}
