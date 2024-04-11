import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Bimbingan } from "./bimbingan.entity";
import { IsString, IsUrl } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class BerkasBimbingan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Bimbingan, (bimbingan) => bimbingan.id)
  bimbingan: Bimbingan;

  @Column({ type: "text" })
  @IsString()
  @ApiProperty()
  nama: string;

  @Column({ type: "text" })
  @IsUrl()
  @ApiProperty()
  url: string;
}
