import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pengguna } from './pengguna.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pengguna, (pengguna) => pengguna.id)
  pengguna: string;
}
