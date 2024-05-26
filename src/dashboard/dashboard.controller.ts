import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  DashboardDto,
  GetDashboardDosbimQueryDto,
  GetDashboardTimTesisReqQueryDto,
  GetDashboardTimTesisRespDto,
  JalurStatisticDto,
} from "./dashboard.dto";
import { DashboardService } from "./dashboard.service";

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
  async findByPenerimaId(
    @Req() request: Request,
    @Query() query: GetDashboardDosbimQueryDto,
  ): Promise<DashboardDto[]> {
    return this.dashboardService.findByDosenId(
      (request.user as AuthDto).id,
      query.search,
    );
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
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @ApiOkResponse({ type: GetDashboardTimTesisRespDto })
  @Get("/tim-tesis")
  async getDashboardTimTesis(
    @Query() query: GetDashboardTimTesisReqQueryDto,
  ): Promise<GetDashboardTimTesisRespDto> {
    return this.dashboardService.getDashboardTimTesis(query);
  }
}
