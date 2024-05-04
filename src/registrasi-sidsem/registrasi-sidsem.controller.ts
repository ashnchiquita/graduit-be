import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  CreatePengajuanSidsemDto,
  GetAllPengajuanSidangReqQueryDto,
  GetAllPengajuanSidangRespDto,
  PengajuanSidsemIdDto,
  SidsemMhsIdParamDto,
  UpdateSidsemDetailDto,
  UpdateSidsemStatusDto,
} from "./registrasi-sidsem.dto";
import { RegistrasiSidsemService } from "./registrasi-sidsem.service";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import { HIGH_AUTHORITY_ROLES } from "src/helper/roles";

@ApiTags("Registrasi Sidang Seminar")
@ApiBearerAuth()
@ApiCookieAuth()
@UseGuards(CustomAuthGuard, RolesGuard)
@Controller("registrasi-sidsem")
export class RegistrasiSidsemController {
  constructor(private readonly regisSidsemService: RegistrasiSidsemService) {}

  @ApiOkResponse({ type: PengajuanSidsemIdDto })
  @Roles(RoleEnum.S2_MAHASISWA)
  @Post()
  async create(@Req() req: Request, @Body() dto: CreatePengajuanSidsemDto) {
    const { id } = req.user as AuthDto;
    return this.regisSidsemService.create(id, dto);
  }

  @ApiOkResponse({ type: GetAllPengajuanSidangRespDto })
  @Get()
  async findAll(@Query() query: GetAllPengajuanSidangReqQueryDto) {
    return this.regisSidsemService.findAll(query);
  }

  @ApiOperation({
    summary: "Update status sidang seminar. Roles: ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: PengajuanSidsemIdDto })
  // @Roles(...HIGH_AUTHORITY_ROLES)
  @Get("/mahasiswa/:mhsId")
  async findOne(@Param() param: SidsemMhsIdParamDto) {
    return this.regisSidsemService.findOne(param.mhsId);
  }

  @ApiOperation({
    summary: "Update status sidang seminar. Roles: ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: PengajuanSidsemIdDto })
  @Roles(...HIGH_AUTHORITY_ROLES)
  @Patch("/mahasiswa/:mhsId/status")
  async updateStatus(
    @Param() param: SidsemMhsIdParamDto,
    @Body() updateDto: UpdateSidsemStatusDto,
  ) {
    return this.regisSidsemService.updateStatus(param.mhsId, updateDto.status);
  }

  @ApiOperation({
    summary:
      "Update detail of approved sidang seminar. Any falsify valued field will be ignored. Roles: ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: PengajuanSidsemIdDto })
  @Roles(...HIGH_AUTHORITY_ROLES)
  @Patch("/mahasiswa/:mhsId/detail")
  async updateDetail(
    @Param() param: SidsemMhsIdParamDto,
    @Body() updateDto: UpdateSidsemDetailDto,
  ) {
    return this.regisSidsemService.updateDetail(param.mhsId, updateDto);
  }
}
