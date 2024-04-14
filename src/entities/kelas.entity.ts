import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MataKuliah } from "./mataKuliah";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";
import { PengajarKelas } from "./pengajarKelas.entity";
import { MahasiswaKelas } from "./mahasiswaKelas";

@Entity()
export class Kelas {
  @ApiProperty({ example: "d290f1ee-6c54-4b01-90e6-d701748f0851" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ example: 1 })
  @Column({ type: "smallint" })
  nomor: number;

  @Column({ type: "text" })
  periode: string;

  @ManyToOne(() => MataKuliah, (mataKuliah) => mataKuliah.kode)
  @JoinColumn({ name: "mataKuliahKode" })
  mataKuliah: MataKuliah;

  @ApiProperty({ minLength: 6, maxLength: 6, example: "IF4031" })
  @IsString()
  @Length(6)
  @Column({ nullable: true })
  mataKuliahKode: string;

  @Column({ type: "varchar", length: 24 })
  warna: string;

  @OneToMany(() => PengajarKelas, (pengajar) => pengajar.kelas)
  pengajar: PengajarKelas[];

  @OneToMany(() => MahasiswaKelas, (mahasiswa) => mahasiswa.kelas)
  mahasiswa: MahasiswaKelas[];
}
