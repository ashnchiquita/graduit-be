import { Body, Controller, Post, Get, Param } from "@nestjs/common";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import { RegistrasiTopikDto } from "src/dto/registrasi-topik";

@Controller("registrasi-tesis")
export class RegistrasiTesisController {
  constructor(
    private readonly registrasiTesisService: RegistrasiTesisService,
  ) {}

  // TODO: Protect using roles and guards

  @Get("/mahasiswa/:mahasiswaId")
  findByUserId(@Param() params: { mahasiswaId: string }) {
    return this.registrasiTesisService.findByUserId(params.mahasiswaId);
  }

  @Post()
  async createTopicRegistration(
    @Body() topicRegistrationDto: RegistrasiTopikDto,
  ) {
    return this.registrasiTesisService.createTopicRegistration(
      "1dceb29c-1e95-4dc6-895e-1321972e27d3", // TODO: Get user id from request, for now use generated UUID
      topicRegistrationDto,
    );
  }
}
