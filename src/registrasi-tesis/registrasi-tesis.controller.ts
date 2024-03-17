import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  NotFoundException,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import {
  RegByMhsParamDto,
  RegParamDto,
  RegQueryDto,
  RegDto,
  ViewQueryDto,
} from "./registrasi-tesis.dto";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";

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

  @Post()
  async createTopicRegistration(@Body() topicRegistrationDto: RegDto) {
    return this.registrasiTesisService.createTopicRegistration(
      "91e9312b-947d-4f34-b05d-c350e6b2d6f7", // TODO: Get user id from request, for now use generated UUID
      topicRegistrationDto,
    );
  }

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
}
