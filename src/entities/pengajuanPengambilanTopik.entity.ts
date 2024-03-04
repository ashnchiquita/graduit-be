import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Topik } from "./topik.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class PengajuanPengambilanTopik {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  disahkan: boolean;

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
  judulTopik: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  idMahasiswa: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  idPembimbing: string;
}
