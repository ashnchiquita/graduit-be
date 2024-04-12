import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
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
  RegByMhsParamDto,
  RegDto,
  RegParamDto,
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

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_MAHASISWA, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get("/mahasiswa/:mahasiswaId")
  findByUserId(@Param() params: RegByMhsParamDto) {
    return this.registrasiTesisService.findByUserId(params.mahasiswaId);
  }

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

  // Right now only admin & timtesis view is handled (apakah dosen perlu summary juga?)
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

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get("/:id")
  async findById(
    @Req() req: Request,
    @Param() params: RegParamDto,
    @Query()
    query: ViewQueryDto,
  ) {
    const { id: idPenerima, roles } = req.user as AuthDto;

    if (!roles.includes(query.view)) {
      throw new ForbiddenException();
    }

    const res = await this.registrasiTesisService.findRegById(params.id);
    if (!res) {
      throw new NotFoundException();
    }

    if (
      query.view === RoleEnum.S2_PEMBIMBING &&
      res.penerima.id !== idPenerima
    ) {
      throw new ForbiddenException();
    }

    return res;
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Patch("/:mhsId/interview")
  async updateInterviewDateByMhsId(
    @Param() params: UpdateByMhsParamsDto,
    @Body() body: UpdateInterviewBodyDto,
  ) {
    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    return await this.registrasiTesisService.updateInterviewDate(
      params.mhsId,
      periode,
      body,
    );
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Patch("/:mhsId/status")
  async updateStatusByMhsId(
    @Param() params: UpdateByMhsParamsDto,
    @Body() body: UpdateStatusBodyDto,
  ) {
    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    return await this.registrasiTesisService.updateStatus(
      params.mhsId,
      periode,
      body,
    );
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Patch("/:mhsId/pembimbing")
  async udpatePembimbingListByMhsId(
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
