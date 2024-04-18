import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PendaftaranTesis } from "./pendaftaranTesis.entity";
// import { Ruangan } from "./ruangan.entity";
import { ApiProperty } from "@nestjs/swagger";
import { PengujiSidsem } from "./pengujiSidsem.entity";

export enum TipeSidsemEnum {
  SEMINAR_1 = "SEMINAR_1",
  SEMINAR_2 = "SEMINAR_2",
  SIDANG = "SIDANG",
}

@Entity()
export class PendaftaranSidsem {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ enum: TipeSidsemEnum })
  @Column({ type: "enum", enum: TipeSidsemEnum })
  tipe: TipeSidsemEnum;

  @ApiProperty()
  @Column({ type: "boolean", default: false })
  ditolak: boolean;

  @ApiProperty()
  @Column({ type: "boolean", nullable: true })
  lulus: boolean;

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  waktuMulai: Date;

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  waktuSelesai: Date;

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  linkw2m: string;

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  pendaftaranTesis: PendaftaranTesis;

  // @ApiProperty({ type: Ruangan, nullable: true })
  // @ManyToOne(() => Ruangan, (ruangan) => ruangan.id)
  // ruangan: Ruangan;

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  ruangan: string;

  @OneToMany(() => PengujiSidsem, (pengujiSidsem) => pengujiSidsem.sidsem)
  penguji: PengujiSidsem[];
}