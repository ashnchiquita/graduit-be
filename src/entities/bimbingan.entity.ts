import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PendaftaranTesis } from "./pendaftaranTesis.entity";

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

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  pendaftaran: PendaftaranTesis;
}
