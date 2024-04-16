import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Kelas } from "./kelas.entity";
import { Pengguna } from "./pengguna.entity";
import { BerkasTugas } from "./berkasTugas.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsUUID, MaxLength } from "class-validator";
import { IsString } from "@nestjs/class-validator";

@Entity()
export class Tugas {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "pembuatId" })
  pembuat: Pengguna;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @Column()
  pembuatId: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  @JoinColumn({ name: "pengubahId" })
  pengubah: Pengguna;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @Column()
  pengubahId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(256)
  @Column({ type: "varchar", length: 256 })
  judul: string;

  @ApiProperty()
  @IsDateString()
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  waktuMulai: Date;

  @ApiProperty()
  @IsDateString()
  @Column({ type: "timestamptz" })
  waktuSelesai: Date;

  @ApiProperty()
  @IsString()
  @Column({ type: "text" })
  deskripsi: string;

  @ApiProperty({ type: [BerkasTugas] })
  @OneToMany(() => BerkasTugas, (berkasTugas) => berkasTugas.tugas, {
    cascade: true,
  })
  berkasTugas: BerkasTugas[];

  @ApiProperty()
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty()
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.id)
  @JoinColumn({ name: "kelasId" })
  kelas: Kelas;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @Column()
  kelasId: string;
}
