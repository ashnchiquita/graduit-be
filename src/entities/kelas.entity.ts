import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MataKuliah } from "./mataKuliah";

@Entity()
export class Kelas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "smallint" })
  nomor: number;

  @Column({ type: "text" })
  periode: string;

  @ManyToOne(() => MataKuliah, (mataKuliah) => mataKuliah.kode)
  mataKuliah: MataKuliah;
}
