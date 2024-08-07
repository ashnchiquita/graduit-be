import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
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
  GetByBimbinganIdResDto,
  GetByMahasiswaIdResDto,
  UpdateStatusDto,
  UpdateStatusResDto,
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
  @ApiNotFoundResponse({ description: "Tidak ada pendaftaran" })
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get("/mahasiswa/:mahasiswaId")
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
  @ApiNotFoundResponse({ description: "Tidak ada pendaftaran" })
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
  @ApiNotFoundResponse({ description: "Tidak ada pendaftaran" })
  @Roles(RoleEnum.S2_MAHASISWA)
  @ApiBody({ type: CreateBimbinganReqDto })
  @Post("/")
  async createBimbinganLog(
    @Req() request: Request,
    @Body() body: CreateBimbinganReqDto,
  ): Promise<CreateBimbinganResDto> {
    return this.bimbinganService.create((request.user as AuthDto).id, body);
  }

  @ApiOkResponse({ type: UpdateStatusResDto })
  @ApiNotFoundResponse({ description: "Bimbingan tidak ditemukan" })
  @ApiForbiddenResponse({
    description: "Anda tidak memiliki akses untuk mengubah status bimbingan",
  })
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN)
  @ApiBody({ type: UpdateStatusDto })
  @Patch("/pengesahan")
  async updateStatus(
    @Req() request: Request,
    @Body() body: UpdateStatusDto,
  ): Promise<UpdateStatusResDto> {
    return this.bimbinganService.updateStatus(request.user as AuthDto, body);
  }

  @ApiOkResponse({ type: GetByBimbinganIdResDto })
  @ApiNotFoundResponse({ description: "Bimbingan tidak ditemukan" })
  @Roles(RoleEnum.S2_PEMBIMBING, RoleEnum.ADMIN)
  @Get("/:bimbinganId")
  async getByBimbinganId(
    @Req() request: Request,
    @Param("bimbinganId") bimbinganId: string,
  ): Promise<GetByBimbinganIdResDto> {
    return this.bimbinganService.getByBimbinganId(
      request.user as AuthDto,
      bimbinganId,
    );
  }
}
