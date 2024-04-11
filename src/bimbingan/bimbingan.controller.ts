import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  ByMhsIdDto,
  CreateBimbinganReqDto,
  CreateBimbinganResDto,
  GetByMahasiswaIdResDto,
} from "./bimbingan.dto";
import { BimbinganService } from "./bimbingan.service";

@ApiTags("Bimbingan")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("bimbingan")
@UseGuards(CustomAuthGuard, RolesGuard)
export class BimbinganController {
  constructor(private readonly bimbinganService: BimbinganService) {}

  @ApiOkResponse({ type: GetByMahasiswaIdResDto })
  @ApiNotFoundResponse({
    description: "Tidak ada pendaftaran pada periode sekarang",
  })
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get("/:mahasiswaId")
  async getByMahasiswaId(
    @Param() param: ByMhsIdDto,
    @Req() request: Request,
  ): Promise<GetByMahasiswaIdResDto> {
    return (await this.bimbinganService.getByMahasiswaId(
      param.mahasiswaId,
      request.user as AuthDto,
    )) as GetByMahasiswaIdResDto;
  }

  @ApiOkResponse({ type: GetByMahasiswaIdResDto })
  @ApiNotFoundResponse({
    description: "Tidak ada pendaftaran pada periode sekarang",
  })
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

  @ApiResponse({ status: 201, type: CreateBimbinganResDto })
  @ApiBadRequestResponse({
    description:
      "Waktu bimbingan lebih dari hari ini atau bimbingan berikutnya sebelum waktu bimbingan yang dimasukkan",
  })
  @ApiNotFoundResponse({
    description: "Tidak ada pendaftaran pada periode sekarang",
  })
  @Roles(RoleEnum.S2_MAHASISWA)
  @ApiBody({ type: CreateBimbinganReqDto })
  @Post("/")
  async createBimbinganLog(
    @Req() request: Request,
    @Body() body: CreateBimbinganReqDto,
  ): Promise<CreateBimbinganResDto> {
    return this.bimbinganService.create((request.user as AuthDto).id, body);
  }
}
