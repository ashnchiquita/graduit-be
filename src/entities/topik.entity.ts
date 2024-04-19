import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class Topik {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column()
  judul: string;

  @ApiProperty()
  @Column({ type: "text" })
  deskripsi: string;

  @ApiProperty({ type: () => Pengguna })
  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "idPengaju" })
  pengaju: Pengguna;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @Column({ nullable: true })
  idPengaju: string;

  @ApiProperty()
  @Column({ type: "text" })
  periode: string;
}
