import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pengguna } from './pengguna.entity';
import { RangeJadwalSeminar } from './rangeJadwalSeminar.entity';
import { Ruangan } from './ruangan.entity';

@Entity()
export class Seminar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  mahasiswa: string;

  @ManyToOne(
    () => RangeJadwalSeminar,
    (rangeJadwalSeminar) => rangeJadwalSeminar.id,
  )
  rangeJadwal: string;

  @ManyToOne(() => Ruangan, (ruangan) => ruangan.id)
  ruangan: string;
}
