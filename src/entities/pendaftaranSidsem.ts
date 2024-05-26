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
import { IsEnum, IsUUID } from "@nestjs/class-validator";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

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
  @IsUUID()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ enum: TipeSidsemEnum })
  @IsEnum(TipeSidsemEnum)
  @Column({ type: "enum", enum: TipeSidsemEnum })
  tipe: TipeSidsemEnum;

  @ApiProperty()
  @IsEnum(SidsemStatus)
  @Column({
    type: "enum",
    enum: SidsemStatus,
    default: SidsemStatus.NOT_ASSIGNED,
  })
  status: SidsemStatus;

  @ApiProperty()
  @IsDateString()
  @Column({ type: "timestamptz", nullable: true })
  jadwal: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Column({ type: "text" })
  judulSidsem: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Column({ type: "text" })
  deskripsiSidsem: string;

  @ManyToOne(() => PendaftaranTesis, (pendaftaranTesis) => pendaftaranTesis.id)
  pendaftaranTesis: PendaftaranTesis;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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

export function cmpTipeSidsem(a: TipeSidsemEnum, b: TipeSidsemEnum): number {
  const tipeSidsemOrder = {
    [TipeSidsemEnum.SEMINAR_1]: 1,
    [TipeSidsemEnum.SEMINAR_2]: 2,
    [TipeSidsemEnum.SIDANG]: 3,
  };

  return tipeSidsemOrder[a] - tipeSidsemOrder[b];
}
