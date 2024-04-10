import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Kelas } from "./kelas.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class MahasiswaKelas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Kelas, (kelas) => kelas.id)
  kelas: Kelas;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @Column({ type: "real", nullable: true })
  nilaiAkhir: number;
}
