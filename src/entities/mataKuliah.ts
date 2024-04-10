import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class MataKuliah {
  @PrimaryColumn({ type: "varchar", length: 6 })
  kode: string;

  @Column({ type: "varchar", length: 256 })
  nama: string;
}
