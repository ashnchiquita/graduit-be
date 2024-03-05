import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Topik } from "./topik.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class PengajuanPengambilanTopik {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  disahkan: boolean;

  @Column({ nullable: true })
  deskripsi: string;

  @Column()
  jalurPilihan: string;

  @Column({ type: "timestamptz" })
  waktuPengiriman: Date;

  @Column({ type: "timestamptz", nullable: true })
  waktuPersetujuan: Date;

  @Column({ type: "timestamptz", nullable: true })
  jadwalInterview: Date;

  @Column({ type: "timestamptz", nullable: true })
  waktuPengesahan: Date;

  @Column({ type: "timestamptz", nullable: true })
  waktuPenolakan: Date;

  @ManyToOne(() => Topik, (topik) => topik.id)
  topik: Topik;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  pembimbing: Pengguna;
}
