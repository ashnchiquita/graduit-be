import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PendaftaranTesis } from "./pendaftaranTesis.entity";
import { Ruangan } from "./ruangan.entity";

export enum TipeSidsemEnum {
  SEMINAR_1 = "SEMINAR_1",
  SEMINAR_2 = "SEMINAR_2",
  SIDANG = "SIDANG",
}

@Entity()
export class PendaftaranSidsem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: TipeSidsemEnum })
  tipe: TipeSidsemEnum;

  @Column({ type: "boolean" })
  ditolak: boolean;

  @Column({ type: "boolean" })
  lulus: boolean;

  @Column({ type: "timestamptz", nullable: true })
  waktuMulai: Date;

  @Column({ type: "timestamptz", nullable: true })
  waktuSelesai: Date;

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  pendaftaranTesis: PendaftaranTesis;

  @ManyToOne(() => Ruangan, (ruangan) => ruangan.id)
  ruangan: Ruangan;
}
