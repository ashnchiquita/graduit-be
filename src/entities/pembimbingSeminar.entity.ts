import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Seminar } from './seminar.entity';
import { Pengguna } from './pengguna.entity';

@Entity()
export class PembimbingSeminar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Seminar, (seminar) => seminar.id)
  seminar: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: string;
}
