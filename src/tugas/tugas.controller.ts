import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TugasService } from "./tugas.service";
import { Roles } from "src/middlewares/roles.decorator";
import { RoleEnum } from "src/entities/pengguna.entity";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  TugasIdDto,
  CreateTugasDto,
  UpdateTugasDto,
  GetTugasByIdRespDto,
  GetTugasByKelasIdQueryDto,
  GetTugasByKelasIdRespDto,
  GetTugasByMahasiswaIdQueryDto,
} from "./tugas.dto";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";

@ApiCookieAuth()
@ApiBearerAuth()
@ApiTags("Tugas")
@UseGuards(CustomAuthGuard, RolesGuard)
@Controller("tugas")
export class TugasController {
  constructor(private readonly tugasService: TugasService) {}

  @ApiOperation({ summary: "Create Tugas. Roles: S2_KULIAH" })
  @ApiCreatedResponse({ type: TugasIdDto })
  @Roles(RoleEnum.S2_KULIAH)
  @Post()
  async createTugas(@Body() createDto: CreateTugasDto, @Req() req: Request) {
    const { id } = req.user as AuthDto;

    return await this.tugasService.createTugas(createDto, id);
  }

  @ApiOperation({ summary: "Update Tugas. Roles: S2_KULIAH" })
  @ApiOkResponse({ type: TugasIdDto })
  @Roles(RoleEnum.S2_KULIAH)
  @Put()
  async updateTugas(@Body() updateDto: UpdateTugasDto, @Req() req: Request) {
    const { id } = req.user as AuthDto;

    return await this.tugasService.updateTugasById(updateDto, id);
  }

  @ApiOperation({
    summary: "Get Tugas by id. Roles: S2_KULIAH, S2_MAHASISWA",
  })
  @ApiOkResponse({ type: GetTugasByIdRespDto })
  @Roles(RoleEnum.S2_KULIAH, RoleEnum.S2_MAHASISWA)
  @Get("/:id")
  async getTugasById(@Param() param: TugasIdDto, @Req() req: Request) {
    let idPengajar = undefined;
    let idMahasiswa = undefined;

    const { id, roles } = req.user as AuthDto;

    if (!roles.includes(RoleEnum.S2_KULIAH)) {
      idMahasiswa = id;
    } else {
      idPengajar = id;
    }

    return this.tugasService.getTugasById(param.id, idMahasiswa, idPengajar);
  }

  @ApiOperation({
    summary: "Get Tugas list by kelas id. Roles: S2_KULIAH",
  })
  @ApiOkResponse({ type: GetTugasByKelasIdRespDto })
  @Roles(RoleEnum.S2_KULIAH)
  @Get()
  async getTugasByKelasId(
    @Req() req: Request,
    @Query() query: GetTugasByKelasIdQueryDto,
  ) {
    const { id } = req.user as AuthDto;

    return this.tugasService.getTugasByKelasId(
      query.kelasId,
      id,
      query.search || "",
      query.page || 1,
      query.limit || 10,
    );
  }

  @ApiOperation({
    summary:
      "Get a specific submisi tugas by mahasiswa ID and tugas ID. Roles: S2_MAHASISWA",
  })
  @Roles(RoleEnum.S2_MAHASISWA)
  @Get("/:id/submisi-tugas")
  async getSubmisiTugasByMahasiswaAndTugasId(
    @Req() req: Request,
    @Param() param: TugasIdDto,
  ) {
    const { id: mahasiswaId } = req.user as AuthDto;

    return await this.tugasService.getSubmisiTugasByMahasiswaAndTugasId(
      mahasiswaId,
      param.id,
    );
  }

  @ApiOperation({
    summary: "Get Tugas list by mahasiswa Id. Roles: S2_MAHASISWA",
  })
  @Roles(RoleEnum.S2_MAHASISWA)
  @Get("/-/daftar-tugas")
  async getTugasByMahasiswaId(
    @Query() query: GetTugasByMahasiswaIdQueryDto,
    @Req() req: Request,
  ) {
    const { id } = req.user as AuthDto;

    return this.tugasService.getDaftarTugasByMahasiswa(
      id,
      query.search || "",
      query.page || 1,
      query.limit || 10,
      query.isSubmitted || undefined,
    );
  }
}
