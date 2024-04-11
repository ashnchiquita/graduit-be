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
import { ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RoleEnum } from "src/entities/pengguna.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  DosbimOptQueryDto,
  DosbimQueryDto,
  GetDosbimResDto,
  SuccessResDto,
  UpdateDosbimDto,
} from "./dosen-bimbingan.dto";
import { DosenBimbinganService } from "./dosen-bimbingan.service";

@ApiTags("Dosen Bimbingan")
@ApiCookieAuth()
@Controller("dosen-bimbingan")
@UseGuards(CustomAuthGuard, RolesGuard)
export class DosenBimbinganController {
  constructor(private readonly dosbimService: DosenBimbinganService) {}

  @ApiOkResponse({ type: [GetDosbimResDto] })
  @Roles(
    RoleEnum.ADMIN,
    RoleEnum.S2_TIM_TESIS,
    RoleEnum.S2_MAHASISWA,
    RoleEnum.S2_TIM_TESIS,
  )
  @Get()
  async get(@Query() query: DosbimOptQueryDto) {
    if (!query.regId) return await this.dosbimService.getAll();

    const res = await this.dosbimService.findByRegId(query.regId);
    const mappedRes: GetDosbimResDto[] = res.map((r) => r.dosen);
    return mappedRes;
  }

  @ApiOkResponse({ type: SuccessResDto })
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Put()
  async updateByRegId(
    @Query() query: DosbimQueryDto,
    @Body() body: UpdateDosbimDto,
  ): Promise<SuccessResDto> {
    await this.dosbimService.updateByRegId(query.regId, body.dosbimIds);

    return {
      status: "ok",
    };
  }

  @ApiOkResponse({ type: SuccessResDto })
  @Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
  @Delete()
  async deleteByRegId(@Query() query: DosbimQueryDto): Promise<SuccessResDto> {
    const res = await this.dosbimService.removeByRegId(query.regId);

    if (!res.affected) throw new NotFoundException();

    return {
      status: "ok",
    };
  }
}
