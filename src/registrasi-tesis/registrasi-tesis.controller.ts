import { Body, Controller, Post, Get } from '@nestjs/common';
import { RegistrasiTesisService } from './registrasi-tesis.service';
import { RegistrasiTopikDto } from 'src/dto/registrasi-topik';

@Controller('registrasi-tesis')
export class RegistrasiTesisController {
  constructor(
    private readonly registrasiTesisService: RegistrasiTesisService,
  ) {}

  // TODO: Protect using roles and guards

  @Get()
  async getTopicRegistrationsByMahasiswaId(@Body() id: string) {
    return this.registrasiTesisService.findTopicRegistrationsByMahasiswaId(id);
  }

  @Post()
  async createTopicRegistration(
    @Body() topicRegistrationDto: RegistrasiTopikDto,
  ) {
    return this.registrasiTesisService.createTopicRegistration(
      'test_id', // TODO: Get user id from request
      topicRegistrationDto,
    );
  }
}
