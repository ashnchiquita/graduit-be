import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pengguna } from './pengguna.entity';

@Entity()
export class Topik {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: string;
}