import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RangeJadwalSidang {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
