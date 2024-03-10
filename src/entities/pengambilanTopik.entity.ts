import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Topik } from "./topik.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class PengambilanTopik {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  deskripsi: string;

  @Column()
  jalurPilihan: string;

  @ManyToOne(() => Topik, (topik) => topik.id)
  topik: Topik;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  pembimbing: Pengguna;
}
