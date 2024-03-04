import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topik } from './topik.entity';
import { Pengguna } from './pengguna.entity';

@Entity()
export class PengajuanPengambilanTopik {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Topik, (topik) => topik.id)
  judulTopik: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  idMahasiswa: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  idPembimbing: string;
}
