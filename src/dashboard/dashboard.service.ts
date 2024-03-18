import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendaftaranTesis } from '../entities/pendaftaranTesis.entity';
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
    console.log('penerimaId:', penerimaId);
    const penerima = await this.penggunaRepository.findOne({ where: { id: penerimaId } });
    console.log('penerima:', penerima);
    if (!penerima) {
      return [];
    }
    const pendaftaranTesis = await this.pendaftaranTesisRepository.find({ where: { penerima }, relations: ["mahasiswa", "topik"] });
    console.log('pendaftaranTesis:', pendaftaranTesis);
    return pendaftaranTesis;
  }
}