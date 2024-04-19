import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { RoleEnum } from "src/entities/pengguna.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import { GetDosbimResDto } from "./dosen-bimbingan.dto";
import { DosenBimbinganService } from "./dosen-bimbingan.service";

@ApiTags("Dosen Bimbingan")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("dosen-bimbingan")
@UseGuards(CustomAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS, RoleEnum.S2_MAHASISWA)
export class DosenBimbinganController {
  constructor(private readonly dosbimService: DosenBimbinganService) {}

  @ApiOkResponse({ type: [GetDosbimResDto] })
  @ApiOperation({
    summary:
      "Get all available dosen bimbingan. Roles: ADMIN, S2_TIM_TESIS, S2_MAHASISWA",
  })
  @Get()
  async get() {
    return await this.dosbimService.getAll();
  }
}
