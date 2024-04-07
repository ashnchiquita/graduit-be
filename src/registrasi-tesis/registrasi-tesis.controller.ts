import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  RegByMhsParamDto,
  RegDto,
  RegParamDto,
  RegQueryDto,
  UpdateInterviewBodyDto,
  UpdateInterviewParamsDto,
  ViewQueryDto,
} from "./registrasi-tesis.dto";
import { RegistrasiTesisService } from "./registrasi-tesis.service";

@ApiTags("Registrasi Tesis")
@Controller("registrasi-tesis")
export class RegistrasiTesisController {
  constructor(
    private readonly registrasiTesisService: RegistrasiTesisService,
    private readonly konfService: KonfigurasiService,
  ) {}

  // TODO: Protect using roles and guards

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

  // TODO Make sure view S2 only shows newest
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get()
  async findAll(
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

    return await this.registrasiTesisService.findAllReg({
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
  @Put("/:mhsId/interview")
  async updateInterviewDateByMhsId(
    @Param() params: UpdateInterviewParamsDto,
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
      body,
    );
  }
}
