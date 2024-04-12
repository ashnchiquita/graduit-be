import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";
import { AuthDto } from "src/auth/auth.dto";
import { Request } from "express";
import {
  DashboardDto,
  DashboardMahasiswaResDto,
  JalurStatisticDto,
} from "./dashboard.dto";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Dashboard")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("dashboard")
@UseGuards(CustomAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOkResponse({ type: [DashboardDto] })
  @Roles(RoleEnum.S2_PEMBIMBING)
  @Get("/dosbim")
  async findByPenerimaId(@Req() request: Request): Promise<DashboardDto[]> {
    return this.dashboardService.findByPenerimaId((request.user as AuthDto).id);
  }

  @ApiOkResponse({ type: [JalurStatisticDto] })
  @Roles(RoleEnum.S2_PEMBIMBING)
  @Get("/dosbim/statistics")
  async getStatisticsByJalurPilihan(@Req() request: Request) {
    return this.dashboardService.getStatisticsByJalurPilihan(
      (request.user as AuthDto).id,
    );
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_MAHASISWA)
  @ApiOkResponse({ type: DashboardMahasiswaResDto })
  @Get("/mahasiswa")
  async getDashboardMahasiswa(
    @Req() request: Request,
  ): Promise<DashboardMahasiswaResDto> {
    return this.dashboardService.getDashboardMahasiswa(
      (request.user as AuthDto).id,
    );
  }
}
