import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ruangan {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
