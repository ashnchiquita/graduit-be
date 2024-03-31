import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  CreateBimbinganReqDto,
  CreateBimbinganResDto,
  GetByMahasiswaIdResDto,
} from "./bimbingan.dto";
import { BimbinganService } from "./bimbingan.service";

@ApiTags("bimbingan")
@Controller("bimbingan")
export class BimbinganController {
  constructor(private readonly bimbinganService: BimbinganService) {}

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get("/:mahasiswaId")
  async getByMahasiswaId(
    @Param("mahasiswaId") mahasiswaId: string,
    @Req() request: Request,
  ): Promise<GetByMahasiswaIdResDto> {
    return this.bimbinganService.getByMahasiswaId(
      mahasiswaId,
      request.user as AuthDto,
    );
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_MAHASISWA)
  @Get("/")
  async getOwnBimbingan(
    @Req() request: Request,
  ): Promise<GetByMahasiswaIdResDto> {
    return this.bimbinganService.getByMahasiswaId(
      (request.user as AuthDto).id,
      request.user as AuthDto,
    );
  }

  // TODO handle file upload
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.S2_MAHASISWA)
  @ApiBody({ type: CreateBimbinganReqDto })
  @Post("/")
  async getBimbinganLogs(
    @Req() request: Request,
    @Body() body: CreateBimbinganReqDto,
  ): Promise<CreateBimbinganResDto> {
    return this.bimbinganService.create((request.user as AuthDto).id, body);
  }
}
