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
import { BerkasSidsem } from "./berkasSidsem.entity";

export enum TipeSidsemEnum {
  SEMINAR_1 = "SEMINAR_1",
  SEMINAR_2 = "SEMINAR_2",
  SIDANG = "SIDANG",
}

export enum SidsemStatus {
  NOT_ASSIGNED = "NOT_ASSIGNED",
  REJECTED = "REJECTED",
  APPROVED = "APPROVED",
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
  @Column({ type: "enum", enum: SidsemStatus })
  status: SidsemStatus;

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  jadwal: Date;

  @ApiProperty()
  @Column({ type: "text" })
  judulSidsem: string;

  @ApiProperty()
  @Column({ type: "text" })
  deskripsiSidsem: string;

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  pendaftaranTesis: PendaftaranTesis;

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  ruangan: string;

  @OneToMany(() => PengujiSidsem, (pengujiSidsem) => pengujiSidsem.sidsem)
  penguji: PengujiSidsem[];

  @ApiProperty({ type: [BerkasSidsem] })
  @OneToMany(
    () => BerkasSidsem,
    (berkasSidsem) => berkasSidsem.pendaftaranSidsem,
    {
      cascade: true,
    },
  )
  berkasSidsem: BerkasSidsem[];

  @ApiProperty()
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  waktuPengiriman: Date;
}
