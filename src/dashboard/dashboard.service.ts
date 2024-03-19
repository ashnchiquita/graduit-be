import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendaftaranTesis } from '../entities/pendaftaranTesis.entity';
import { JalurEnum } from '../entities/pendaftaranTesis.entity';
import { Pengguna } from '../entities/pengguna.entity';
import { Topik } from '../entities/topik.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private pendaftaranTesisRepository: Repository<PendaftaranTesis>,
    @InjectRepository(Pengguna)
    private penggunaRepository: Repository<Pengguna>,
    @InjectRepository(Topik)
    private topikRepository: Repository<Topik>,
  ) {}

  async findAll(): Promise<PendaftaranTesis[]> {
    return this.pendaftaranTesisRepository.find({ relations: ["mahasiswa", "topik"] });
  }

  async findByPenerimaId(penerimaId: string): Promise<PendaftaranTesis[]> {
    const penerima = await this.penggunaRepository.findOne({ where: { id: penerimaId } });
    if (!penerima) {
      return [];
    }
    const pendaftaranTesis = await this.pendaftaranTesisRepository.find({ where: { penerima }, relations: ["mahasiswa", "topik"] });
    return pendaftaranTesis;
  }

  async getStatisticsByJalurPilihan(penerimaId: string): Promise<{ jalurPilihan: JalurEnum; count: number }[]> {
    const penerima = await this.penggunaRepository.findOne({ where: { id: penerimaId } });
    if (!penerima) {
      return [];
    }
    const statistics = await this.pendaftaranTesisRepository
      .createQueryBuilder('pendaftaranTesis')
      .select('pendaftaranTesis.jalurPilihan', 'jalurPilihan')
      .addSelect('COUNT(*)', 'count')
      .where('pendaftaranTesis.penerima = :penerima', { penerima: penerima.id })
      .groupBy('pendaftaranTesis.jalurPilihan')
      .getRawMany();
    return statistics;
  }
}