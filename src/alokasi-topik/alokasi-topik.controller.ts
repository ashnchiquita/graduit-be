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
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { RoleEnum } from "src/entities/pengguna.entity";
import { KonfigurasiService } from "src/konfigurasi/konfigurasi.service";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  CreateBulkTopikDto,
  TopikIdRespDto,
  CreateTopikDto,
  GetAllRespDto,
  OmittedTopik,
  TopikParamDto,
  TopikQueryDto,
  UpdateTopikDto,
  createBulkRespDto,
} from "./alokasi-topik.dto";
import { AlokasiTopikService } from "./alokasi-topik.service";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { HIGH_AUTHORITY_ROLES, isHighAuthority } from "src/helper/roles";

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

  @ApiOperation({
    summary: "Create new topik. Roles: S2_TIM_TESIS, ADMIN, S2_PEMBIMBING",
  })
  @ApiCreatedResponse({ type: TopikIdRespDto })
  @Roles(...HIGH_AUTHORITY_ROLES, RoleEnum.S2_PEMBIMBING)
  @Post()
  async create(
    @Body() createDto: CreateTopikDto,
    @Req() req: Request,
  ): Promise<TopikIdRespDto> {
    const periode = await this.konfService.getPeriodeOrFail();

    const { roles, id } = req.user as AuthDto;
    // user only has S2_PEMBIMBING role
    if (!isHighAuthority(roles) && createDto.idPengaju !== id) {
      throw new BadRequestException("Pengaju ID harus sama dengan user ID");
    }

    return await this.alokasiTopikService.create({ ...createDto, periode });
  }

  @ApiOperation({
    summary: "Create multiple topik. Roles: S2_TIM_TESIS, ADMIN",
  })
  @ApiOkResponse({ type: createBulkRespDto })
  @Roles(...HIGH_AUTHORITY_ROLES)
  @Post("/bulk")
  async createBulk(@Body() createDto: CreateBulkTopikDto) {
    const periode = await this.konfService.getPeriodeOrFail();

    return await this.alokasiTopikService.createBulk(createDto, periode);
  }

  @ApiOperation({
    summary:
      "Get topik by ID. Roles: S2_TIM_TESIS, ADMIN, S2_PEMBIMBING, S2_MAHASISWA",
  })
  @ApiOkResponse({ type: OmittedTopik })
  @Roles(...HIGH_AUTHORITY_ROLES, RoleEnum.S2_PEMBIMBING, RoleEnum.S2_MAHASISWA)
  @Get("/:id")
  async getById(@Param() params: TopikParamDto) {
    const periode = await this.konfService.getPeriodeOrFail();

    const res = await this.alokasiTopikService.findById(params.id, periode);
    if (!res) throw new NotFoundException();
    return res as OmittedTopik;
  }

  @ApiOperation({
    summary:
      "Get all topik. Roles: S2_TIM_TESIS, ADMIN, S2_MAHASISWA, S2_PEMBIMBING",
  })
  @ApiOkResponse({ type: GetAllRespDto })
  @Roles(...HIGH_AUTHORITY_ROLES, RoleEnum.S2_MAHASISWA, RoleEnum.S2_PEMBIMBING)
  @Get()
  async getAll(
    @Query()
    query: TopikQueryDto,
  ) {
    const periode = await this.konfService.getPeriodeOrFail();

    return await this.alokasiTopikService.findAllCreatedByPembimbing({
      page: query.page || 1,
      ...query,
      periode,
    });
  }

  @ApiOperation({
    summary: "Update topik. Roles: S2_TIM_TESIS, ADMIN, S2_PEMBIMBING",
  })
  @ApiOkResponse({ type: TopikIdRespDto })
  @Roles(...HIGH_AUTHORITY_ROLES, RoleEnum.S2_PEMBIMBING)
  @Put("/:id")
  async update(
    @Param() params: TopikParamDto,
    @Body() updateDto: UpdateTopikDto,
    @Req() req: Request,
  ): Promise<TopikIdRespDto> {
    const periode = await this.konfService.getPeriodeOrFail();

    let idPengaju = undefined;
    const { roles, id } = req.user as AuthDto;
    // user only has S2_PEMBIMBING role
    if (!isHighAuthority(roles)) {
      if (updateDto.idPengaju !== id) {
        throw new BadRequestException("Pengaju ID harus sama dengan user ID");
      }
      idPengaju = id;
    }

    const res = await this.alokasiTopikService.update(
      params.id,
      updateDto,
      periode,
      idPengaju,
    );
    if (!res.affected)
      throw new NotFoundException(
        "Topik tidak ditemukan di antara topik yang dapat Anda akses",
      );

    const resp: TopikIdRespDto = { id: params.id };

    return resp;
  }

  @ApiOperation({
    summary: "Delete topik. Roles: S2_TIM_TESIS, ADMIN, S2_PEMBIMBING",
  })
  @ApiOkResponse({ type: TopikIdRespDto })
  @Roles(...HIGH_AUTHORITY_ROLES, RoleEnum.S2_PEMBIMBING)
  @Delete("/:id")
  async delete(
    @Param() params: TopikParamDto,
    @Req() req: Request,
  ): Promise<TopikIdRespDto> {
    const periode = await this.konfService.getPeriodeOrFail();

    let idPengaju = undefined;
    const { roles, id } = req.user as AuthDto;
    // user only has S2_PEMBIMBING role
    if (!isHighAuthority(roles)) {
      idPengaju = id;
    }

    const res = await this.alokasiTopikService.remove(
      params.id,
      periode,
      idPengaju,
    );
    if (!res.affected)
      throw new NotFoundException(
        "Topik tidak ditemukan di antara topik yang dapat Anda akses",
      );

    const resp: TopikIdRespDto = { id: params.id };
    return resp;
  }
}
