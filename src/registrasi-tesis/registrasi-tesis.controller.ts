import { Body, Controller, Post, Get, Param } from "@nestjs/common";
import { RegistrasiTesisService } from "./registrasi-tesis.service";
import { RegistrasiTopikDto } from "./registrasi-tesis.dto";

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
      "ae9697b9-590f-4820-826b-948f5e746ca7", // TODO: Get user id from request, for now use generated UUID
      topicRegistrationDto,
    );
  }
}
