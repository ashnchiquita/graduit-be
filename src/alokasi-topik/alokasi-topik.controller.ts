import {
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
  CreateBulkTopikDto,
  CreateRespDto,
  CreateTopikDto,
  GetAllRespDto,
  OmittedTopik,
  TopikParamDto,
  TopikQueryDto,
  UpdateTopikDto,
  createBulkRespDto,
} from "./alokasi-topik.dto";
import { AlokasiTopikService } from "./alokasi-topik.service";

@ApiTags("Alokasi Topik")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("alokasi-topik")
@UseGuards(CustomAuthGuard, RolesGuard)
export class AlokasiTopikController {
  constructor(private alokasiTopikService: AlokasiTopikService) {}

  @ApiOkResponse({ type: CreateRespDto })
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Post()
  async create(@Body() createDto: CreateTopikDto) {
    return await this.alokasiTopikService.create({ ...createDto });
  }

  @ApiOkResponse({ type: createBulkRespDto })
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Post("/bulk")
  async createBulk(@Body() createDto: CreateBulkTopikDto) {
    return await this.alokasiTopikService.createBulk(createDto);
  }

  @ApiOkResponse({ type: OmittedTopik })
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Get("/:id")
  async getById(@Param() params: TopikParamDto) {
    const res = await this.alokasiTopikService.findActiveTopikById(params.id);
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
    return await this.alokasiTopikService.findAllActiveTopikCreatedByPembimbing(
      {
        page: query.page || 1,
        ...query,
      },
    );
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
