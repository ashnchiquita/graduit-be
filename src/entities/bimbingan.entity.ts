import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Topik } from "./topik.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class Bimbingan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  waktuBimbingan: string;

  @Column({ type: "text" })
  laporanKemajuan: string;

  @Column({ type: "text" })
  todo: string;

  @Column({ type: "date", nullable: true })
  bimbinganBerikutnya: string;

  @Column({ type: "simple-array" })
  berkasLinks: string[];

  @ManyToOne(() => Topik, (topik) => topik.id)
  topik: Topik;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;
}
