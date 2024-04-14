import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthDto } from "src/auth/auth.dto";
import { RoleEnum } from "src/entities/pengguna.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RolesGuard } from "src/middlewares/roles.guard";
import {
  CreateSubmisiReqDto,
  CreateSubmisiResDto,
  GetSubmisiResDto,
} from "./submisi.dto";
import { SubmisiService } from "./submisi.service";

@ApiTags("Submisi Tugas")
@ApiCookieAuth()
@ApiBearerAuth()
@Controller("submisi")
@UseGuards(CustomAuthGuard, RolesGuard)
export class SubmisiController {
  constructor(private readonly submisiService: SubmisiService) {}

  @ApiOkResponse({ type: GetSubmisiResDto })
  @Roles(RoleEnum.S2_MAHASISWA)
  @Get("/:mahasiswaId/:tugasId")
  async getSubmisiMahasiswaByTugasId(
    @Param("mahasiswaId") mahasiswaId: string,
    @Param("tugasId") tugasId: string,
    @Req() request: Request,
  ): Promise<GetSubmisiResDto> {
    return this.submisiService.getSubmisiMahasiswaByTugasId(
      mahasiswaId,
      tugasId,
      request.user as AuthDto,
    );
  }

  @ApiResponse({ status: 201, type: CreateSubmisiResDto })
  @Roles(RoleEnum.S2_MAHASISWA)
  @ApiBody({ type: CreateSubmisiReqDto })
  @Post("/")
  async createSubmission(
    @Req() request: Request,
    @Body() createSubmisiReqDto: CreateSubmisiReqDto,
  ): Promise<CreateSubmisiResDto> {
    return this.submisiService.createSubmission(
      createSubmisiReqDto,
      request.user as AuthDto,
    );
  }
}
