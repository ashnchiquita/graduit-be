import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Kelas } from "./kelas.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class MahasiswaKelas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Kelas, (kelas) => kelas.id)
  @JoinColumn({ name: "kelasId" })
  kelas: Kelas;

  @Column()
  kelasId: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "mahasiswaId" })
  mahasiswa: Pengguna;

  @Column()
  mahasiswaId: string;

  @Column({ type: "real", nullable: true })
  nilaiAkhir?: number;
}
