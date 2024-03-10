import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RoleEnum {
  ADMIN = "ADMIN",
  TU = "TU",
  S2_MAHASISWA = "S2_MAHASISWA",
  S2_PEMBIMBING = "S2_PEMBIMBING",
  S2_PENGUJI = "S2_PENGUJI",
  S2_TIM_TESIS = "S2_TIM_TESIS",
  S2_KULIAH = "S2_KULIAH",
}

@Entity()
export class Pengguna {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  nama: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", nullable: true })
  password: string;

  @Column({
    type: "enum",
    enum: RoleEnum,
    array: true,
    default: [],
  })
  roles: RoleEnum[];
}
