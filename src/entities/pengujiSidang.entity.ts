import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sidang } from "./sidang.entity";
import { Pengguna } from "./pengguna.entity";

@Entity()
export class PengujiSidang {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Sidang, (sidang) => sidang.id)
  sidang: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: string;
}
