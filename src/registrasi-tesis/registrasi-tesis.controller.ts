import {
  BadRequestException,
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
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  FindAllNewestRegRespDto,
  GetByIdRespDto,
  IdDto,
  RegByMhsParamDto,
  RegDto,
  RegQueryDto,
  RegStatisticsRespDto,
  UpdateByMhsParamsDto,
  UpdateInterviewBodyDto,
  UpdatePembimbingBodyDto,
  UpdateStatusBodyDto,
  ViewQueryDto,
} from "./registrasi-tesis.dto";
import { RegistrasiTesisService } from "./registrasi-tesis.service";

@ApiCookieAuth()
@ApiBearerAuth()
@ApiTags("Registrasi Tesis")
@Controller("registrasi-tesis")
export class RegistrasiTesisController {
  constructor(
    private readonly registrasiTesisService: RegistrasiTesisService,
    private readonly konfService: KonfigurasiService,
  ) {}

  @ApiOperation({
    summary:
      "Create new registration. Roles: S2_MAHASISWA, ADMIN, S2_TIM_TESIS",
  })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_MAHASISWA, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Post()
  async createTopicRegistration(
    @Body() topicRegistrationDto: RegDto,
    @Req() req: Request,
  ) {
    const { id } = req.user as AuthDto;

    return this.registrasiTesisService.createTopicRegistration(
      id,
      topicRegistrationDto,
    );
  }

  @ApiOperation({
    summary:
      "Find registrations (historical) by Mahasiswa ID. Roles: S2_MAHASISWA, ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: [GetByIdRespDto] })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_MAHASISWA, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get("/mahasiswa/:mahasiswaId")
  async findByUserId(@Param() params: RegByMhsParamDto, @Req() req: Request) {
    const { id, roles } = req.user as AuthDto;

    if (
      !roles.includes(RoleEnum.ADMIN) &&
      !roles.includes(RoleEnum.S2_TIM_TESIS)
    ) {
      // roles only include RoleEnum.S2_MAHASISWA
      if (id !== params.mahasiswaId) {
        throw new ForbiddenException();
      }
    }

    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    return this.registrasiTesisService.findByUserId(
      params.mahasiswaId,
      periode,
      false,
      undefined,
    );
  }

  @ApiOperation({
    summary:
      "Find newest registration by Mahasiswa ID. Roles: ADMIN, S2_TIM_TESIS, S2_PEMBIMBING",
  })
  @ApiOkResponse({ type: GetByIdRespDto })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS, RoleEnum.S2_PEMBIMBING)
  @Get("/mahasiswa/:mahasiswaId/newest")
  async findNewestByUserId(
    @Param() params: RegByMhsParamDto,
    @Req() req: Request,
  ) {
    const { id, roles } = req.user as AuthDto;

    let idPenerima = undefined;
    if (
      !roles.includes(RoleEnum.ADMIN) &&
      !roles.includes(RoleEnum.S2_TIM_TESIS)
    ) {
      // roles only include RoleEnum.S2_PEMBIMBING
      idPenerima = id;
    }

    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    const res = await this.registrasiTesisService.findByUserId(
      params.mahasiswaId,
      periode,
      true,
      idPenerima,
    );

    return res[0];
  }

  @ApiOperation({
    summary:
      "Get statistics of registrations. Roles: S2_PEMBIMBING, ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: RegStatisticsRespDto })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get("/statistics")
  async getRegsStatistics(@Req() req: Request, @Query() query: ViewQueryDto) {
    const { id: idPenerima, roles } = req.user as AuthDto;

    if (!roles.includes(query.view)) {
      throw new ForbiddenException();
    }

    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    return this.registrasiTesisService.getRegsStatistics({
      periode,
      idPenerima: query.view == RoleEnum.S2_PEMBIMBING ? idPenerima : undefined,
    });
  }

  // Admin & TimTesis view will show newst reg records per Mahasiswa
  // Pembimbing view will show all regs towards them
  @ApiOperation({
    summary:
      "Find all newest registration for each Mahasiswa. Roles: S2_PEMBIMBING, ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: FindAllNewestRegRespDto, isArray: true })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get()
  async findAllNewest(
    @Query()
    query: RegQueryDto,
    @Req() req: Request,
  ) {
    const { id: idPenerima, roles } = req.user as AuthDto;

    if (!roles.includes(query.view)) {
      throw new ForbiddenException();
    }

    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    return await this.registrasiTesisService.findAllRegs({
      ...query,
      page: query.page || 1,
      idPenerima:
        query.view === RoleEnum.S2_PEMBIMBING ? idPenerima : undefined,
      periode,
    });
  }

  @ApiOperation({
    summary:
      "Update interview date of newest in process registration by Mahasiswa ID. Roles: S2_PEMBIMBING, ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: IdDto })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS, RoleEnum.S2_PEMBIMBING)
  @Patch("/:mhsId/interview")
  async updateInterviewDateByMhsId(
    @Param() params: UpdateByMhsParamsDto,
    @Body() body: UpdateInterviewBodyDto,
    @Req() req: Request,
  ) {
    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    const { id, roles } = req.user as AuthDto;
    let idPenerima = undefined;

    if (
      !roles.includes(RoleEnum.ADMIN) &&
      !roles.includes(RoleEnum.S2_TIM_TESIS)
    ) {
      // roles only include RoleEnum.S2_PEMBIMBING
      idPenerima = id;
    }

    return await this.registrasiTesisService.updateInterviewDate(
      params.mhsId,
      periode,
      body,
      idPenerima,
    );
  }

  @ApiOperation({
    summary:
      "Update status of newest registration by Mahasiswa ID. Roles: S2_PEMBIMBING, ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: IdDto })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS, RoleEnum.S2_PEMBIMBING)
  @Patch("/:mhsId/status")
  async updateStatusByMhsId(
    @Param() params: UpdateByMhsParamsDto,
    @Body() body: UpdateStatusBodyDto,
    @Req() req: Request,
  ) {
    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    const { id, roles } = req.user as AuthDto;
    let idPenerima = undefined;

    if (
      !roles.includes(RoleEnum.ADMIN) &&
      !roles.includes(RoleEnum.S2_TIM_TESIS)
    ) {
      // roles only include RoleEnum.S2_PEMBIMBING
      idPenerima = id;
    }

    return await this.registrasiTesisService.updateStatus(
      params.mhsId,
      periode,
      body,
      idPenerima,
    );
  }

  @ApiOperation({
    summary:
      "Update pembimbing list of approved registration by Mahasiswa ID. Roles: ADMIN, S2_TIM_TESIS",
  })
  @ApiOkResponse({ type: IdDto })
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Patch("/:mhsId/pembimbing")
  async updatePembimbingListByMhsId(
    @Param() params: UpdateByMhsParamsDto,
    @Body() body: UpdatePembimbingBodyDto,
  ) {
    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    return await this.registrasiTesisService.updatePembimbingList(
      params.mhsId,
      periode,
      body,
    );
  }
}
