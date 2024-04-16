import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TugasService } from "./tugas.service";
import { Roles } from "src/middlewares/roles.decorator";
import { RoleEnum } from "src/entities/pengguna.entity";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  TugasIdDto,
  CreateTugasDto,
  UpdateTugasDto,
  GetTugasByIdRespDto,
} from "./tugas.dto";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";

@ApiCookieAuth()
@ApiBearerAuth()
@ApiTags("Tugas")
@UseGuards(CustomAuthGuard, RolesGuard)
@Controller("tugas")
export class TugasController {
  constructor(private readonly tugasService: TugasService) {}

  @ApiCreatedResponse({ type: TugasIdDto })
  @Roles(RoleEnum.S2_KULIAH)
  @Post()
  async createTugas(@Body() createDto: CreateTugasDto, @Req() req: Request) {
    const { id } = req.user as AuthDto;

    return await this.tugasService.createTugas(createDto, id);
  }

  @ApiOkResponse({ type: TugasIdDto })
  @Roles(RoleEnum.S2_KULIAH)
  @Put()
  async updateTugas(@Body() updateDto: UpdateTugasDto, @Req() req: Request) {
    const { id } = req.user as AuthDto;

    return await this.tugasService.updateTugasById(updateDto, id);
  }

  @ApiOkResponse({ type: GetTugasByIdRespDto })
  @Roles(RoleEnum.S2_KULIAH, RoleEnum.S2_MAHASISWA)
  @Get("/:id")
  async getTugasById(@Param() param: TugasIdDto, @Req() req: Request) {
    let idPengajar = undefined;
    let idMahasiswa = undefined;

    const { id, roles } = req.user as AuthDto;

    if (!roles.includes(RoleEnum.S2_KULIAH)) {
      idMahasiswa = id;
    } else {
      idPengajar = id;
    }

    return this.tugasService.getTugasById(param.id, idMahasiswa, idPengajar);
  }
}
