import {
  Body,
  Controller,
  ForbiddenException,
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
import {
  DOSEN,
  HIGH_AUTHORITY_ROLES,
  isDosen,
  isHighAuthority,
} from "src/helper/roles";

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
  @Roles(...HIGH_AUTHORITY_ROLES, ...DOSEN)
  @Get()
  async findAll(
    @Req() req: Request,
    @Query() query: GetAllPengajuanSidangReqQueryDto,
  ) {
    const { id, roles } = req.user as AuthDto;

    if (!roles.includes(query.view)) {
      throw new ForbiddenException();
    }

    return this.regisSidsemService.findAll(
      query,
      query.view === RoleEnum.S2_PEMBIMBING ? id : undefined,
      query.view === RoleEnum.S2_PENGUJI ? id : undefined,
    );
  }

  @ApiOkResponse({ type: PengajuanSidsemIdDto })
  @Roles(...HIGH_AUTHORITY_ROLES, ...DOSEN, RoleEnum.S2_MAHASISWA)
  @Get("/mahasiswa/:mhsId")
  async findOne(@Req() req: Request, @Param() param: SidsemMhsIdParamDto) {
    let idPenguji = undefined;
    let idPembimbing = undefined;

    const { roles, id } = req.user as AuthDto;

    if (!isHighAuthority(roles)) {
      if (roles.includes(RoleEnum.S2_PEMBIMBING)) {
        idPembimbing = id;
      }

      if (roles.includes(RoleEnum.S2_PENGUJI)) {
        idPenguji = id;
      }

      if (!isDosen(roles) && id !== param.mhsId) {
        // user is mahasiswa
        throw new ForbiddenException("Ini bukan data Anda.");
      }
    }
    return this.regisSidsemService.findOne(
      param.mhsId,
      idPembimbing,
      idPenguji,
    );
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
