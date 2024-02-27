import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Bimbingan } from './bimbingan.entity';
import { Pengguna } from './pengguna.entity';

@Entity()
export class DosenBimbingan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Bimbingan, (bimbingan) => bimbingan.id)
  bimbingan: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: string;
}
