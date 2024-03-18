import { JalurEnum, RegStatus } from '../entities/pendaftaranTesis.entity';

export class DashboardDto {
  id: string;
  jalurPilihan: JalurEnum;
  waktuPengiriman: Date;
  jadwalInterview: Date;
  waktuKeputusan: Date;
  status: RegStatus;
  periode: string;
  topikId: string;
  mahasiswaId: string;
  penerimaId: string;
}