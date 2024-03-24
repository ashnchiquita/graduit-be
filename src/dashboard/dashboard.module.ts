import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PendaftaranTesis } from '../entities/pendaftaranTesis.entity';
import { Pengguna } from '../entities/pengguna.entity';
import { Topik } from '../entities/topik.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PendaftaranTesis, Pengguna, Topik])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}