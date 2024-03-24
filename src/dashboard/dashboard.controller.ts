import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";


@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get(':dosenId')
  async findByPenerimaId(@Param('dosenId') penerimaId: string) {
    return this.dashboardService.findByPenerimaId(penerimaId);
  }
  @Get(':dosenId/statistics')
  async getStatisticsByJalurPilihan(@Param('dosenId') penerimaId: string) {
    return this.dashboardService.getStatisticsByJalurPilihan(penerimaId);
  }
}