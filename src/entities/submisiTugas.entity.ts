import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pengguna } from "./pengguna.entity";
import { Tugas } from "./tugas.entity";
import { BerkasSubmisiTugas } from "./berkasSubmisiTugas.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

@Entity()
export class SubmisiTugas {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "mahasiswaId" })
  mahasiswa: Pengguna;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @Column()
  mahasiswaId: string;

  @ApiProperty()
  @IsString()
  @Column({ type: "text" })
  jawaban: string;

  @ApiProperty({ description: "true means submitted, false means draft" })
  @Column({ type: "boolean" })
  isSubmitted: boolean; // false means draft (saved), true means submitted

  @ApiProperty({ type: [BerkasSubmisiTugas] })
  @OneToMany(
    () => BerkasSubmisiTugas,
    (berkasSubmisiTugas) => berkasSubmisiTugas.submisiTugas,
  )
  berkasSubmisiTugas: BerkasSubmisiTugas[];

  @ApiProperty()
  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  submittedAt: Date;

  @ManyToOne(() => Tugas, (tugas) => tugas.id)
  @JoinColumn({ name: "tugasId" })
  tugas: Tugas;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @Column()
  tugasId: string;
}
