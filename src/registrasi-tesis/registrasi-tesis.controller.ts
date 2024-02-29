import { Controller, Get, Param } from "@nestjs/common";
import { RegistrasiTesisService } from "./registrasi-tesis.service";

@Controller("registrasi-tesis")
export class RegistrasiTesisController {
  constructor(private registrasiTesisService: RegistrasiTesisService) {}

  @Get("/mahasiswa/:mahasiswaId")
  findByUserId(@Param() params: { mahasiswaId: string }) {
    return this.registrasiTesisService.findByUserId(params.mahasiswaId);
  }
}
