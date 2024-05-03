import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  GetAllPengajuanSidangReqQueryDto,
  GetAllPengajuanSidangRespDto,
  GetOnePengajuanSidangRespDto,
  UpdateAlokasiRuanganReqDto,
  UpdateAlokasiRuanganRespDto,
} from "./registrasi-sidsem.dto";
import { RegistrasiSidsemService } from "./registrasi-sidsem.service";
import { HIGH_AUTHORITY_ROLES } from "src/helper/roles";

@ApiTags("Alokasi Ruangan")
@ApiBearerAuth()
@ApiCookieAuth()
@UseGuards(CustomAuthGuard, RolesGuard)
@Roles(...HIGH_AUTHORITY_ROLES)
@Controller("alokasi-ruangan")
export class RegistrasiSidsemController {
  constructor(private readonly regisSidsemService: RegistrasiSidsemService) {}
  @ApiOkResponse({ type: GetAllPengajuanSidangRespDto })
  @Get()
  async findAll(
    @Query() query: GetAllPengajuanSidangReqQueryDto,
  ): Promise<GetAllPengajuanSidangRespDto> {
    return this.regisSidsemService.findAll(query);
  }

  @ApiOkResponse({ type: GetOnePengajuanSidangRespDto })
  @Get(":id")
  async findOne(
    @Param("id") id: string,
  ): Promise<GetOnePengajuanSidangRespDto> {
    return this.regisSidsemService.findOne(id);
  }

  @ApiOkResponse({ type: UpdateAlokasiRuanganRespDto })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateAlokasiRuanganDto: UpdateAlokasiRuanganReqDto,
  ): Promise<UpdateAlokasiRuanganRespDto> {
    return this.regisSidsemService.update(id, updateAlokasiRuanganDto);
  }
}
