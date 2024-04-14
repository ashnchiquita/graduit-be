import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  AssignKelasDto,
  CreateKelasDto,
  GetKelasQueryDto,
  GetListKelasRespDto,
  KodeRespDto,
  MessageResDto,
  UnassignKelasDto,
  UserKelasResDto,
} from "./kelas.dto";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { KelasService } from "./kelas.service";
import { Roles } from "src/middlewares/roles.decorator";
import { MataKuliah } from "src/entities/mataKuliah";

@ApiTags("Kelas")
@ApiBearerAuth()
@ApiCookieAuth()
@Controller("kelas")
@UseGuards(CustomAuthGuard, RolesGuard)
export class KelasController {
  constructor(private readonly kelasServ: KelasService) {}

  @ApiOkResponse({ type: GetListKelasRespDto, isArray: true })
  @Roles(RoleEnum.S2_KULIAH, RoleEnum.S2_MAHASISWA, RoleEnum.S2_TIM_TESIS)
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

    return await this.kelasServ.getListKelas(idMahasiswa, idPengajar);
  }

  @Roles(RoleEnum.S2_TIM_TESIS)
  @Post()
  async createKelas(@Body() body: CreateKelasDto) {
    return await this.kelasServ.create(body);
  }

  @ApiCreatedResponse({ type: KodeRespDto })
  @Roles(RoleEnum.S2_TIM_TESIS)
  @Post("mata-kuliah")
  async createMataKuliah(@Body() body: MataKuliah) {
    return await this.kelasServ.createMatkul(body);
  }

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @ApiOkResponse({ type: UserKelasResDto, isArray: true })
  @Get("/mahasiswa")
  async getMahasiswa(): Promise<UserKelasResDto[]> {
    return await this.kelasServ.getKelasPengguna("MAHASISWA");
  }

  @ApiCreatedResponse({ type: MessageResDto })
  @ApiInternalServerErrorResponse({ description: "Gagal menambahkan kelas" })
  @Post("/mahasiswa/assign")
  async assignKelasMahasiswa(
    @Body() body: AssignKelasDto,
  ): Promise<MessageResDto> {
    return await this.kelasServ.assignKelasMahasiswa(body);
  }

  @ApiOkResponse({ type: MessageResDto })
  @ApiInternalServerErrorResponse({ description: "Gagal menghapus kelas" })
  @Delete("/mahasiswa/unassign")
  async unassignKelasMahasiswa(
    @Body() body: UnassignKelasDto,
  ): Promise<MessageResDto> {
    return await this.kelasServ.unassignKelasMahasiswa(body);
  }

  @Roles(RoleEnum.S2_TIM_TESIS, RoleEnum.ADMIN)
  @ApiOkResponse({ type: UserKelasResDto, isArray: true })
  @Get("/dosen")
  async getDosen(): Promise<UserKelasResDto[]> {
    return await this.kelasServ.getKelasPengguna("DOSEN");
  }

  @ApiCreatedResponse({ type: MessageResDto })
  @ApiInternalServerErrorResponse({ description: "Gagal menambahkan kelas" })
  @Post("/dosen/assign")
  async assignKelasDosen(@Body() body: AssignKelasDto): Promise<MessageResDto> {
    return await this.kelasServ.assignKelasDosen(body);
  }

  @ApiOkResponse({ type: MessageResDto })
  @ApiInternalServerErrorResponse({ description: "Gagal menghapus kelas" })
  @Delete("/dosen/unassign")
  async unassignKelasDosen(
    @Body() body: UnassignKelasDto,
  ): Promise<MessageResDto> {
    return await this.kelasServ.unassignKelasDosen(body);
  }
}
