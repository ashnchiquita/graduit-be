import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsString, IsUrl } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PendaftaranSidsem } from "./pendaftaranSidsem";

@Entity()
export class BerkasSidsem {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(
    () => PendaftaranSidsem,
    (pendaftaranSidsem) => pendaftaranSidsem.id,
    {
      orphanedRowAction: "delete",
    },
  )
  pendaftaranSidsem: PendaftaranSidsem;

  @Column({ type: "text" })
  @IsString()
  @ApiProperty()
  nama: string;

  @Column({ type: "text" })
  @IsUrl()
  @ApiProperty({ example: "https://example.com/berkas.pdf" })
  url: string;
}
