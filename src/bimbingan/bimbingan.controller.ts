import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { BimbinganService } from "./bimbingan.service";
import { GetByMahasiswaIdResDto } from "./bimbingan.dto";
import { Request } from "express";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";
import { AuthDto } from "src/auth/auth.dto";

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
}
