import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PendaftaranTesis } from "./pendaftaranTesis.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BerkasBimbingan } from "./berkasBimbingan";

export enum BimbinganStatus {
  LANCAR = "LANCAR",
  BUTUH_BIMBINGAN = "BUTUH_BIMBINGAN",
  TERKENDALA = "TERKENDALA",
}

@Entity()
export class Bimbingan {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ type: Date })
  @Column({ type: "date" })
  waktuBimbingan: string;

  @ApiProperty()
  @Column({ type: "text" })
  laporanKemajuan: string;

  @ApiProperty()
  @Column({ type: "text" })
  todo: string;

  @ApiPropertyOptional({ type: Date })
  @Column({ type: "date", nullable: true })
  bimbinganBerikutnya: string;

  @ApiProperty()
  @Column({ type: "boolean", default: false })
  disahkan: boolean;

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  pendaftaran: PendaftaranTesis;

  @ApiProperty({ type: [BerkasBimbingan] })
  @OneToMany(
    () => BerkasBimbingan,
    (berkasBimbingan) => berkasBimbingan.bimbingan,
    {
      cascade: true,
    },
  )
  berkas: BerkasBimbingan[];
}
