import { Body, Controller, Get, Patch, Query, UseGuards } from "@nestjs/common";
import { NilaiService } from "./nilai.service";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RoleEnum } from "src/entities/pengguna.entity";
import {
  GetNilaiByMatkulQueryDto,
  GetNilaiByMatkulRespDto,
  UpdateNilaiDto,
  UpdateNilaiRespDto,
} from "./nilai.dto";

@ApiBearerAuth()
@ApiCookieAuth()
@ApiTags("Nilai")
@UseGuards(CustomAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS)
@Controller("nilai")
export class NilaiController {
  constructor(private nilaiServ: NilaiService) {}

  @ApiOkResponse({ type: [GetNilaiByMatkulRespDto] })
  @Get()
  async getNilaiByMatkul(@Query() query: GetNilaiByMatkulQueryDto) {
    return this.nilaiServ.getNilaiByMatkul(
      query.kode,
      query.page || 1,
      query.limit || 10,
      query.search || "",
    );
  }

  @ApiOkResponse({ type: UpdateNilaiRespDto })
  @Patch()
  async updateNilai(@Body() body: UpdateNilaiDto) {
    return this.nilaiServ.updateNilai(body.mahasiswaKelasIds, body.nilaiAkhir);
  }
}
