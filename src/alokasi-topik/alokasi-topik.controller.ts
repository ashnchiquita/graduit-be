import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  CreateTopikDto,
  GetAllRespDto,
  OmittedTopik,
  TopikParamDto,
  TopikQueryDto,
  UpdateTopikDto,
} from "./alokasi-topik.dto";
import { AlokasiTopikService } from "./alokasi-topik.service";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RoleEnum } from "src/entities/pengguna.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Alokasi Topik")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("alokasi-topik")
@UseGuards(CustomAuthGuard, RolesGuard)
export class AlokasiTopikController {
  constructor(
    private alokasiTopikService: AlokasiTopikService,
    private konfService: KonfigurasiService,
  ) {}

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Post()
  async create(@Body() createDto: CreateTopikDto) {
    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) throw new BadRequestException("Periode belum dikonfigurasi.");

    return await this.alokasiTopikService.create({ ...createDto, periode });
  }

  @ApiOkResponse({ type: OmittedTopik })
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Get("/:id")
  async getById(@Param() params: TopikParamDto) {
    const res = await this.alokasiTopikService.findById(params.id);
    if (!res) throw new NotFoundException();
    return res as OmittedTopik;
  }

  @ApiOkResponse({ type: GetAllRespDto })
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN, RoleEnum.S2_MAHASISWA)
  @Get()
  async getAll(
    @Query()
    query: TopikQueryDto,
  ) {
    const periode = await this.konfService.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!periode) throw new BadRequestException("Periode belum dikonfigurasi.");

    return await this.alokasiTopikService.findAllCreatedByPembimbing({
      page: query.page || 1,
      ...query,
      periode,
    });
  }

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Put("/:id")
  async update(
    @Param() params: TopikParamDto,
    @Body() updateDto: UpdateTopikDto,
  ) {
    const res = await this.alokasiTopikService.update(params.id, updateDto);
    if (!res.affected) throw new NotFoundException();
    return res;
  }

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Delete("/:id")
  async delete(@Param() params: TopikParamDto) {
    const res = await this.alokasiTopikService.remove(params.id);
    if (!res.affected) throw new NotFoundException();
    return res;
  }
}
