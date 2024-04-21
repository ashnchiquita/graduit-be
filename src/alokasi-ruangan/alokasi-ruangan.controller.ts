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
import { RoleEnum } from "src/entities/pengguna.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  GetAllPengajuanSidangReqQueryDto,
  GetAllPengajuanSidangRespDto,
  GetOnePengajuanSidangRespDto,
  UpdateAlokasiRuanganReqDto,
  UpdateAlokasiRuanganRespDto,
} from "./alokasi-ruangan.dto";
import { AlokasiRuanganService } from "./alokasi-ruangan.service";

@ApiTags("Alokasi Ruangan")
@ApiBearerAuth()
@ApiCookieAuth()
@UseGuards(CustomAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.TU)
@Controller("alokasi-ruangan")
export class AlokasiRuanganController {
  constructor(private readonly alokasiRuanganService: AlokasiRuanganService) {}
  @ApiOkResponse({ type: GetAllPengajuanSidangRespDto })
  @Get()
  async findAll(
    @Query() query: GetAllPengajuanSidangReqQueryDto,
  ): Promise<GetAllPengajuanSidangRespDto> {
    return this.alokasiRuanganService.findAll(query);
  }

  @ApiOkResponse({ type: GetOnePengajuanSidangRespDto })
  @Get(":id")
  async findOne(
    @Param("id") id: string,
  ): Promise<GetOnePengajuanSidangRespDto> {
    return this.alokasiRuanganService.findOne(id);
  }

  @ApiOkResponse({ type: UpdateAlokasiRuanganRespDto })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateAlokasiRuanganDto: UpdateAlokasiRuanganReqDto,
  ): Promise<UpdateAlokasiRuanganRespDto> {
    return this.alokasiRuanganService.update(id, updateAlokasiRuanganDto);
  }
}
