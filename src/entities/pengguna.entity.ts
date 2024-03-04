import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Pengguna {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  nama: string;

  @Column()
  email: string;

  @Column()
  status: string;

  @Column("simple-array")
  roles: string[];
}
