import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Kelas } from "./kelas.entity";
import { Pengguna } from "./pengguna.entity";
import { BerkasTugas } from "./berkasTugas";

@Entity()
export class Tugas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  pembuat: Pengguna;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  pengubah: Pengguna;

  @Column({ type: "varchar", length: 256 })
  judul: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  waktuMulai: Date;

  @Column({ type: "timestamptz" })
  waktuSelesai: Date;

  @Column({ type: "text" })
  deskripsi: string;

  @OneToMany(() => BerkasTugas, (berkasTugas) => berkasTugas.tugas)
  berkasTugas: BerkasTugas[];

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.id)
  kelas: Kelas;
}
