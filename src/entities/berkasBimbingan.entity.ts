import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Bimbingan } from "./bimbingan.entity";
import { IsString, IsUrl } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class BerkasBimbingan {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Bimbingan, (bimbingan) => bimbingan.id, {
    orphanedRowAction: "delete",
  })
  bimbingan: Bimbingan;

  @Column({ type: "text" })
  @IsString()
  @ApiProperty()
  nama: string;

  @Column({ type: "text" })
  @IsUrl()
  @ApiProperty({ example: "https://example.com/berkas.pdf" })
  url: string;
}
