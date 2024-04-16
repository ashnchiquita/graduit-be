import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PendaftaranTesis } from "./pendaftaranTesis.entity";

export enum RoleEnum {
  ADMIN = "ADMIN",
  TU = "TU",
  S2_MAHASISWA = "S2_MAHASISWA",
  S2_PEMBIMBING = "S2_PEMBIMBING",
  S2_PENGUJI = "S2_PENGUJI",
  S2_TIM_TESIS = "S2_TIM_TESIS",
  S2_KULIAH = "S2_KULIAH",
  S1_MAHASISWA = "S1_MAHASISWA",
  S1_PEMBIMBING = "S1_PEMBIMBING",
  S1_PENGUJI = "S1_PENGUJI",
  S1_TIM_TA = "S1_TIM_TA",
  S1_KULIAH = "S1_KULIAH",
}

@Entity()
export class Pengguna {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column()
  nama: string;

  @ApiProperty({ example: "13521999@mahasiswa.itb.ac.id" })
  @Column({ type: "text", unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ type: "text", nullable: true })
  password: string;

  @ApiPropertyOptional({ example: "13521999" })
  @Column({ type: "varchar", length: 8, nullable: true })
  nim: string;

  @ApiProperty({ enum: RoleEnum, isArray: true })
  @Column({
    type: "enum",
    enum: RoleEnum,
    array: true,
    default: [],
  })
  roles: RoleEnum[];

  @ApiPropertyOptional()
  @Column({ type: "text", nullable: true })
  kontak: string;

  @OneToMany(() => PendaftaranTesis, (pendaftaran) => pendaftaran.mahasiswa)
  pendaftaranTesis: PendaftaranTesis[];
}
