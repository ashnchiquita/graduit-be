import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { KonfigurasiService } from "./konfigurasi.service";
import { KonfigurasiDto, UpdateKonfigurasiResDto } from "./konfigurasi.dto";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";

@Controller("konfigurasi")
export class KonfigurasiController {
  constructor(private readonly konfigurasiService: KonfigurasiService) {}

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Put()
  async updateKonfigurasi(
    @Body() data: KonfigurasiDto,
  ): Promise<UpdateKonfigurasiResDto> {
    await this.konfigurasiService.udpateKonfigurasi(data);
    return { message: "success" };
  }

  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Get()
  async getKonfigurasi(): Promise<KonfigurasiDto> {
    return this.konfigurasiService.getKonfigurasi();
  }
}
