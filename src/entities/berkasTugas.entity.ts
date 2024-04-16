import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tugas } from "./tugas.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsUrl, IsUUID } from "class-validator";
import { IsString } from "@nestjs/class-validator";

@Entity()
export class BerkasTugas {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Tugas, (tugas) => tugas.id, { orphanedRowAction: "delete" })
  tugas: Tugas;

  @ApiProperty()
  @IsString()
  @Column({ type: "text" })
  nama: string;

  @ApiProperty()
  @IsUrl()
  @Column({ type: "text" })
  url: string;
}
