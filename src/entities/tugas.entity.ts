import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Kelas } from './kelas.entity';
import { Pengguna } from './pengguna.entity';

@Entity()
export class Tugas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Kelas, (kelas) => kelas.id)
  kelas: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: string;
}
