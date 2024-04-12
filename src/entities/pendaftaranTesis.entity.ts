import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { Topik } from "./topik.entity";
import { ApiProperty } from "@nestjs/swagger";
import { DosenBimbingan } from "./dosenBimbingan.entity";

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
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ enum: JalurEnum })
  @Column({ type: "enum", enum: JalurEnum })
  jalurPilihan: JalurEnum;

  @ApiProperty()
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  waktuPengiriman: Date;

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  jadwalInterview: Date;

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  waktuKeputusan: Date;

  @ApiProperty({ enum: RegStatus })
  @Column({ type: "enum", enum: RegStatus, default: RegStatus.NOT_ASSIGNED })
  status: RegStatus;

  @ManyToOne(() => Topik, (topik) => topik.id)
  topik: Topik;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: Pengguna;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  penerima: Pengguna;

  @OneToMany(
    () => DosenBimbingan,
    (dosenBimbingan) => dosenBimbingan.pendaftaran,
  )
  dosenBimbingan: DosenBimbingan[];
}
