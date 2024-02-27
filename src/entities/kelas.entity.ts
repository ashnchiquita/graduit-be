import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Kelas {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
