import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sidang } from "./sidang.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class PembimbingSidang {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Sidang, (sidang) => sidang.id)
  sidang: Sidang;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: Pengguna;
}
