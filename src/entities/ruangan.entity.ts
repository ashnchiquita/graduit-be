import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ruangan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  nama: string;
}
