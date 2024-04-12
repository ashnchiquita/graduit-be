import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { KonfigurasiService } from "./konfigurasi.service";
import { KonfigurasiArrDto, UpdateKonfigurasiResDto } from "./konfigurasi.dto";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Konfigurasi")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("konfigurasi")
@UseGuards(CustomAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
export class KonfigurasiController {
  constructor(private readonly konfigurasiService: KonfigurasiService) {}

  @ApiOkResponse({ type: UpdateKonfigurasiResDto })
  @Put()
  async updateKonfigurasi(
    @Body() data: KonfigurasiArrDto,
  ): Promise<UpdateKonfigurasiResDto> {
    await this.konfigurasiService.updateKonfigurasi(data);
    return { message: "success" };
  }

  @ApiOkResponse({ type: KonfigurasiArrDto })
  @Get()
  async getKonfigurasi(): Promise<KonfigurasiArrDto> {
    return this.konfigurasiService.getKonfigurasi();
  }
}
