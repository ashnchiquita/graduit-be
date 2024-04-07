import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { Topik } from "./topik.entity";

export enum RegStatus {
  NOT_ASSIGNED = "NOT_ASSIGNED",
  INTERVIEW = "INTERVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum JalurEnum {
  CS = "CS",
  SEI = "SEI",
  IS = "IS",
  IT = "IT",
  INTS = "INTS",
  MMT = "MMT",
  CC = "CC",
  DSAI = "DSAI",
  CSEC = "CSEC",
}

@Entity()
export class PendaftaranTesis {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: JalurEnum })
  jalurPilihan: JalurEnum;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  waktuPengiriman: Date;

  @Column({ type: "timestamptz", nullable: true })
  jadwalInterview: Date;

  @Column({ type: "timestamptz", nullable: true })
  waktuKeputusan: Date;

  @Column({ type: "enum", enum: RegStatus, default: RegStatus.NOT_ASSIGNED })
  status: RegStatus;

  @ManyToOne(() => Topik, (topik) => topik.id)
  topik: Topik;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  penerima: Pengguna;
}
