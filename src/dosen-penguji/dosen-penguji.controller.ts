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
import { GetDosujiResDto } from "./dosen-penguji.dto";
import { DosenPengujiService } from "./dosen-penguji.service";

@ApiTags("Dosen Penguji")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("dosen-penguji")
@UseGuards(CustomAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
export class DosenPengujiController {
  constructor(private readonly dosujiService: DosenPengujiService) {}

  @ApiOkResponse({ type: [GetDosujiResDto] })
  @ApiOperation({
    summary: "Get all available dosen penguji. Roles: ADMIN, S2_TIM_TESIS",
  })
  @Get()
  async get() {
    return await this.dosujiService.getAll();
  }
}
