import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topik } from './topik.entity';
import { Pengguna } from './pengguna.entity';

@Entity()
export class Bimbingan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Topik, (topik) => topik.id)
  topik: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: string;
}
