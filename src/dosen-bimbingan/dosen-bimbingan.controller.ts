import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DosenBimbinganService } from "./dosen-bimbingan.service";
import {
  DosbimOptQueryDto,
  DosbimQueryDto,
  UpdateDosbimDto,
} from "./dosen-bimbingan.dto";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RoleEnum } from "src/entities/pengguna.entity";

@Controller("dosen-bimbingan")
export class DosenBimbinganController {
  constructor(private readonly dosbimService: DosenBimbinganService) {}

  @Get()
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS, RoleEnum.S2_MAHASISWA)
  async get(@Query() query: DosbimOptQueryDto) {
    if (!query.regId) return await this.dosbimService.getAll();

    const res = await this.dosbimService.findByRegId(query.regId);
    const mappedRes = res.map((r) => r.dosen);
    return mappedRes;
  }

  @Put()
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  async updateByRegId(
    @Query() query: DosbimQueryDto,
    @Body() body: UpdateDosbimDto,
  ) {
    await this.dosbimService.updateByRegId(query.regId, body.dosbimIds);

    return {
      status: "ok",
    };
  }

  @Delete()
  @UseGuards(CustomAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  async deleteByRegId(@Query() query: DosbimQueryDto) {
    const res = await this.dosbimService.removeByRegId(query.regId);

    if (!res.affected) throw new NotFoundException();

    return {
      status: "ok",
    };
  }
}
