import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
  sidsem: PendaftaranSidsem;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: Pengguna;
}
