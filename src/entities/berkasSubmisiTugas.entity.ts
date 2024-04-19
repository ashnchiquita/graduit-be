import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SubmisiTugas } from "./submisiTugas.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "@nestjs/class-validator";
import { IsUrl } from "class-validator";

@Entity()
export class BerkasSubmisiTugas {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => SubmisiTugas, (submisi) => submisi.id, {
    orphanedRowAction: "delete",
  })
  submisiTugas: SubmisiTugas;

  @ApiProperty()
  @IsString()
  @Column({ type: "text" })
  nama: string;

  @ApiProperty({ example: "https://example.com/berkas.pdf" })
  @IsUrl()
  @Column({ type: "text" })
  url: string;
}