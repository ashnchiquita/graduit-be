import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Topik } from "./topik.entity";
import { Pengguna } from "./pengguna.entity";

export enum RegStatus {
  NOT_ASSIGNED = "NOT_ASSIGNED",
  INTERVIEW = "INTERVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum JalurEnum {
  CS = "Ilmu Komputer (CS)",
  SEI = "Rekayasa Perangkat Lunak dan Inovasi (SEI)",
  IS = "Sistem Informasi (IS)",
  IT = "Teknologi Informasi (IT)",
  INTS = "Sistem Inteligensi (IntS)",
  MMT = "Teknologi Media dan Piranti Bergerak (MMT)",
  CC = "Komputasi Cloud (CC)",
  DSAI = "Sains Data dan Inteligensi Buatan (DS-AI)",
  CSEC = "Keamanan Siber (CSec)",
}

@Entity()
export class PengajuanPengambilanTopik {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: JalurEnum })
  jalur: JalurEnum;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  waktuPengiriman: Date;

  @Column({ type: "timestamptz", nullable: true })
  jadwalInterview: Date;

  @Column({ type: "timestamptz", nullable: true })
  waktuKeputusan: Date;

  @Column({ type: "enum", enum: RegStatus, default: RegStatus.NOT_ASSIGNED })
  status: RegStatus;

  @ManyToOne(() => Topik, (topik) => topik.id)
  @JoinColumn({ name: "idTopik" })
  topik: Topik;

  @Column({ nullable: true })
  idTopik: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "idMahasiswa" })
  mahasiswa: Pengguna;

  @Column({ nullable: true })
  idMahasiswa: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "idPembimbing" })
  pembimbing: Pengguna;

  @Column({ nullable: true })
  idPembimbing: string;
}
