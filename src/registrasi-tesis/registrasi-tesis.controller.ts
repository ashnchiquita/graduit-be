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
} from "@nestjs/common";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import { RegStatus } from "src/entities/pengajuanPengambilanTopik.entity";
import { RegistrasiTopikDto } from "./registrasi-tesis.dto";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";

@Controller("registrasi-tesis")
export class RegistrasiTesisController {
  constructor(
    private readonly registrasiTesisService: RegistrasiTesisService,
  ) {}

  // TODO: Protect using roles and guards

  @Get("/mahasiswa/:mahasiswaId")
  findByUserId(@Param() params: { mahasiswaId: string }) {
    return this.registrasiTesisService.findByUserId(params.mahasiswaId);
  }

  @Post()
  async createTopicRegistration(
    @Body() topicRegistrationDto: RegistrasiTopikDto,
  ) {
    return this.registrasiTesisService.createTopicRegistration(
      "ae9697b9-590f-4820-826b-948f5e746ca7", // TODO: Get user id from request, for now use generated UUID
      topicRegistrationDto,
    );
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING)
  @Get()
  findAll(
    @Query()
    query: {
      search?: string;
      status: RegStatus;
      page: number;
      limit: number;
    },
    @Req() req: Request,
  ) {
    const { id: idPembimbing } = req.user as AuthDto;

    return this.registrasiTesisService.findAllReg({
      ...query,
      idPembimbing,
    });
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING)
  @Get("/:id")
  async findById(@Req() req: Request, @Param() params: { id: string }) {
    const res = await this.registrasiTesisService.findRegById(params.id);
    if (!res) {
      throw new NotFoundException();
    }

    const { id: idPembimbing } = req.user as AuthDto;
    if (res.pembimbing.id !== idPembimbing) {
      throw new ForbiddenException();
    }

    return res;
  }
}
