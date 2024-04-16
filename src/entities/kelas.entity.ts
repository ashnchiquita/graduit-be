import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MataKuliah } from "./mataKuliah.entity";
import { ApiProperty } from "@nestjs/swagger";
import { PengajarKelas } from "./pengajarKelas.entity";
import { MahasiswaKelas } from "./mahasiswaKelas.entity";
import {
  IsPositive,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from "@nestjs/class-validator";
import { Tugas } from "./tugas.entity";

@Entity()
export class Kelas {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "smallint" })
  @ApiProperty({ example: 1 })
  @IsPositive()
  nomor: number;

  @ApiProperty()
  @IsString()
  @Column({ type: "text" })
  periode: string;

  @ApiProperty({ type: MataKuliah })
  @ManyToOne(() => MataKuliah, (mataKuliah) => mataKuliah.kode)
  @JoinColumn({ name: "mataKuliahKode" })
  mataKuliah: MataKuliah;

  @ApiProperty({ minLength: 6, maxLength: 6, example: "IF4031" })
  @IsString()
  @Length(6)
  @Column({ nullable: true })
  mataKuliahKode: string;

  @ApiProperty({ example: "bg-blue-600/20" })
  @IsString()
  @MaxLength(24)
  @Column({ type: "varchar", length: 24 })
  warna: string;

  @OneToMany(() => PengajarKelas, (pengajar) => pengajar.kelas)
  pengajar: PengajarKelas[];

  @OneToMany(() => MahasiswaKelas, (mahasiswa) => mahasiswa.kelas)
  mahasiswa: MahasiswaKelas[];

  @OneToMany(() => Tugas, (tugas) => tugas.kelas)
  tugas: Tugas[];
}
