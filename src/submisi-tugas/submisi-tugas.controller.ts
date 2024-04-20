import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SubmisiTugasService } from "./submisi-tugas.service";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RoleEnum } from "src/entities/pengguna.entity";
import {
  CreateSubmisiTugasDto,
  GetSubmisiTugasByIdRespDto,
  GetSubmisiTugasByTugasIdQueryDto,
  GetSubmisiTugasByTugasIdRespDto,
  SubmisiTugasIdDto,
} from "./submisi-tugas.dto";
import { AuthDto } from "src/auth/auth.dto";
import { Request } from "express";
import { SubmisiTugas } from "src/entities/submisiTugas.entity";

@ApiTags("Submisi Tugas")
@ApiBearerAuth()
@ApiCookieAuth()
@UseGuards(CustomAuthGuard, RolesGuard)
@Controller("submisi-tugas")
export class SubmisiTugasController {
  constructor(private submisiTugasServ: SubmisiTugasService) {}

  @ApiOperation({
    summary: "Create submisi tugas. Roles: S2_MAHASISWA",
  })
  @Roles(RoleEnum.S2_MAHASISWA)
  @Post()
  async createSubmisiTugas(
    @Body() createDto: CreateSubmisiTugasDto,
    @Req() req: Request,
  ) {
    const { id } = req.user as AuthDto;

    return await this.submisiTugasServ.createSubmisiTugas(createDto, id);
  }

  @ApiOperation({
    summary:
      "Get submisi tugas by submisi tugas id. Roles: S2_KULIAH, S2_MAHASISWA",
  })
  @ApiOkResponse({ type: GetSubmisiTugasByIdRespDto })
  @Roles(RoleEnum.S2_KULIAH, RoleEnum.S2_MAHASISWA)
  @Get("/:id")
  async getSubmisiTugasById(
    @Req() req: Request,
    @Param() param: SubmisiTugasIdDto,
  ) {
    const { id, roles } = req.user as AuthDto;

    let idMahasiswa = undefined;
    let idPengajar = undefined;

    if (!roles.includes(RoleEnum.S2_KULIAH)) {
      idMahasiswa = id;
    } else {
      idPengajar = id;
    }

    return await this.submisiTugasServ.getSubmisiTugasById(
      param.id,
      idMahasiswa,
      idPengajar,
    );
  }

  @ApiOperation({
    summary: "Get list of submisi tugas summary by tugas id. Roles: S2_KULIAH",
  })
  @ApiOkResponse({ type: [GetSubmisiTugasByTugasIdRespDto] })
  @Roles(RoleEnum.S2_KULIAH)
  @Get()
  async getSubmisiTugasByTugasId(
    @Req() req: Request,
    @Query() query: GetSubmisiTugasByTugasIdQueryDto,
  ) {
    const { id } = req.user as AuthDto;

    return await this.submisiTugasServ.getSubmisiTugasByTugasId(
      query.tugasId,
      id,
      query.search || "",
      query.page || 1,
      query.limit || 10,
      query.order || "ASC",
      query.isSubmitted,
    );
  }

  @ApiOperation({
    summary:
      "Get a specific submisi tugas by mahasiswa ID and tugas ID. Roles: S2_KULIAH, S2_MAHASISWA",
  })
  @ApiOkResponse({ type: SubmisiTugas })
  @Roles(RoleEnum.S2_KULIAH, RoleEnum.S2_MAHASISWA)
  @Get(":mahasiswaId/:tugasId")
  async getSubmisiTugasByMahasiswaAndTugasId(
    @Param("mahasiswaId") mahasiswaId: string,
    @Param("tugasId") tugasId: string,
  ): Promise<SubmisiTugas> {
    return await this.submisiTugasServ.getSubmisiTugasByMahasiswaAndTugasId(
      mahasiswaId,
      tugasId,
    );
  }
}
