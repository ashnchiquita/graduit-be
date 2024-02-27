import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Kelas } from './kelas.entity';
import { Pengguna } from './pengguna.entity';

@Entity()
export class PengajarKelas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Kelas, (kelas) => kelas.id)
  kelas: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  dosen: string;
}
