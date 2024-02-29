import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Pengguna {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}
