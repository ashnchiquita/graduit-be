import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  NotFoundException,
  UnauthorizedException,
  Query,
} from "@nestjs/common";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import { RegStatus } from "src/entities/pengajuanPengambilanTopik.entity";
import { RegistrasiTopikDto } from "./registrasi-tesis.dto";

@Controller("registrasi-tesis")
export class RegistrasiTesisController {
  constructor(
    private readonly registrasiTesisService: RegistrasiTesisService
  ) {}

  // TODO: Protect using roles and guards

  @Get("/mahasiswa/:mahasiswaId")
  findByUserId(@Param() params: { mahasiswaId: string }) {
    return this.registrasiTesisService.findByUserId(params.mahasiswaId);
  }

  @Post()
  async createTopicRegistration(
    @Body() topicRegistrationDto: RegistrasiTopikDto
  ) {
    return this.registrasiTesisService.createTopicRegistration(
      "ae9697b9-590f-4820-826b-948f5e746ca7", // TODO: Get user id from request, for now use generated UUID
      topicRegistrationDto
    );
  }

  @Get()
  findAll(
    @Query()
    query: {
      search?: string;
      status: RegStatus;
      page: number;
      limit: number;
    }
  ) {
    // TODO: get id from session
    const idPembimbing = "5f8869cf-fff0-4c71-ada2-83ddf5d8277d";

    return this.registrasiTesisService.findAllRegByDosbim(
      query.status,
      query.page,
      query.limit,
      idPembimbing,
      query.search
    );
  }

  @Get("/:id")
  async findById(@Param() params: { id: string }) {
    const res = await this.registrasiTesisService.findRegById(params.id);
    if (!res) {
      throw new NotFoundException("Registration not found.");
    }

    // TODO: get id from session
    const idPembimbing = "5f8869cf-fff0-4c71-ada2-83ddf5d8277d";
    if (res.pembimbing.id !== idPembimbing) {
      throw new UnauthorizedException(
        "You are not authorized to access this registration."
      );
    }

    return res;
  }
}
