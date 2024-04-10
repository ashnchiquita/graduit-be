import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Kelas } from "./kelas.entity";
import { Pengguna } from "./pengguna.entity";

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

  @Column({
    type: "text",
    array: true,
    default: [],
  })
  berkas: string[];

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.id)
  kelas: Kelas;
}
