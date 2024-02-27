import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RangeJadwalSeminar {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
