import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Konfigurasi {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text", unique: true })
  key: string;

  @Column({ type: "text" })
  value: string;
}
