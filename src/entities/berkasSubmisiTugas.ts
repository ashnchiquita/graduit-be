import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SubmisiTugas } from "./submisiTugas";

@Entity()
export class BerkasSubmisiTugas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => SubmisiTugas, (submisi) => submisi.id)
  submisiTugas: SubmisiTugas;

  @Column({ type: "text" })
  nama: string;

  @Column({ type: "text" })
  url: string;
}
