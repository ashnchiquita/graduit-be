import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ByIdKelasDto,
  CreateKelasDto,
  DeleteKelasDto,
  GetKelasDetailRespDto,
  GetKelasQueryDto,
  GetKelasRespDto,
  GetNextNomorResDto,
  IdKelasResDto,
  KodeRespDto,
  UpdateKelasDto,
} from "./kelas.dto";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { KelasService } from "./kelas.service";
import { Roles } from "src/middlewares/roles.decorator";
import { MataKuliah } from "src/entities/mataKuliah.entity";
import { Kelas } from "src/entities/kelas.entity";

@ApiTags("Kelas")
@ApiBearerAuth()
@ApiCookieAuth()
@Controller("kelas")
@UseGuards(CustomAuthGuard, RolesGuard)
export class KelasController {
  constructor(private readonly kelasServ: KelasService) {}

  @ApiOkResponse({ type: GetKelasRespDto, isArray: true })
  @Roles(
    RoleEnum.S2_KULIAH,
    RoleEnum.S2_MAHASISWA,
    RoleEnum.S2_TIM_TESIS,
    RoleEnum.ADMIN,
  )
  @Get()
  async getListKelas(@Query() query: GetKelasQueryDto, @Req() req: Request) {
    let idMahasiswa = undefined;
    let idPengajar = undefined;

    const { id, roles } = req.user as AuthDto;

    if (!roles.includes(query.view)) {
      throw new ForbiddenException();
    }

    if (query.view === RoleEnum.S2_KULIAH) {
      idPengajar = id;
    }

    if (query.view === RoleEnum.S2_MAHASISWA) {
      idMahasiswa = id;
    }

    return await this.kelasServ.getListKelas(
      idMahasiswa,
      idPengajar,
      query.kodeMatkul,
      query.search,
    );
  }

  @ApiOkResponse({ type: MataKuliah, isArray: true })
  @Get("/mata-kuliah")
  async getAllMatkul() {
    return await this.kelasServ.getAllMatkul();
  }

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @ApiOkResponse({ type: GetNextNomorResDto })
  @Get("/next-nomor/:kodeMatkul")
  async getNextNomor(
    @Param("kodeMatkul") kodeMatkul: string,
  ): Promise<GetNextNomorResDto> {
    const nomor = await this.kelasServ.getNextNomorKelas(kodeMatkul);

    return {
      nomor,
    };
  }

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @ApiOkResponse({ type: IdKelasResDto })
  @ApiBadRequestResponse({
    description: "Nomor kelas sudah ada",
  })
  @ApiInternalServerErrorResponse({
    description: "Gagal membuat kelas",
  })
  @Post()
  async createKelas(@Body() body: CreateKelasDto): Promise<IdKelasResDto> {
    return await this.kelasServ.create(body);
  }

  // TODO: restrict payload
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @ApiOkResponse({ type: IdKelasResDto })
  @ApiNotFoundResponse({
    description: "Kelas dengan id (dan nomor) yang terkait tidak ditemukan",
  })
  @ApiBadRequestResponse({
    description:
      "(Saat pembuatan kelas) nomor kelas sudah ada atau mataKuliahKode tidak ada",
  })
  @ApiInternalServerErrorResponse({
    description: "Gagal memperbarui kelas atau gagal membuat kelas",
  })
  @Put()
  async updateKelas(@Body() body: UpdateKelasDto): Promise<IdKelasResDto> {
    return await this.kelasServ.updateOrCreate(body);
  }

  @ApiCreatedResponse({ type: KodeRespDto })
  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @Post("mata-kuliah")
  async createMataKuliah(@Body() body: MataKuliah) {
    return await this.kelasServ.createMatkul(body);
  }

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @ApiOkResponse({ type: Kelas })
  @ApiNotFoundResponse({ description: "Kelas tidak ditemukan" })
  @ApiInternalServerErrorResponse({ description: "Gagal menghapus kelas" })
  @Delete()
  async delete(@Body() body: DeleteKelasDto): Promise<Kelas> {
    return await this.kelasServ.delete(body);
  }

  @Roles(
    RoleEnum.S2_TIM_TESIS,
    RoleEnum.ADMIN,
    RoleEnum.S2_KULIAH,
    RoleEnum.S2_MAHASISWA,
  )
  @ApiOkResponse({ type: GetKelasRespDto })
  @Get("/:id")
  async getById(
    @Param() param: ByIdKelasDto,
    @Req() req: Request,
  ): Promise<GetKelasRespDto> {
    let idMahasiswa = undefined;
    let idPengajar = undefined;

    const { id, roles } = req.user as AuthDto;

    if (
      !roles.includes(RoleEnum.S2_TIM_TESIS) &&
      !roles.includes(RoleEnum.ADMIN)
    ) {
      if (roles.includes(RoleEnum.S2_KULIAH)) {
        idPengajar = id;
      } else {
        // requester only has S2_MAHASISWA access
        idMahasiswa = id;
      }
    }

    return await this.kelasServ.getById(param.id, idMahasiswa, idPengajar);
  }

  @Roles(
    RoleEnum.S2_TIM_TESIS,
    RoleEnum.ADMIN,
    RoleEnum.S2_KULIAH,
    RoleEnum.S2_MAHASISWA,
  )
  @ApiOkResponse({ type: GetKelasDetailRespDto })
  @Get("/:id/detail")
  async getKelasDetail(@Param() param: ByIdKelasDto, @Req() req: Request) {
    let idMahasiswa = undefined;
    let idPengajar = undefined;

    const { id, roles } = req.user as AuthDto;

    if (
      !roles.includes(RoleEnum.S2_TIM_TESIS) &&
      !roles.includes(RoleEnum.ADMIN)
    ) {
      if (roles.includes(RoleEnum.S2_KULIAH)) {
        idPengajar = id;
      } else {
        // requester only has S2_MAHASISWA access
        idMahasiswa = id;
      }
    }

    return await this.kelasServ.getKelasDetail(
      param.id,
      idMahasiswa,
      idPengajar,
    );
  }
}
