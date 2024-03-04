import { Test, TestingModule } from '@nestjs/testing';
import { RegistrasiTesisService } from './registrasi-tesis.service';

describe('RegistrasiTesisService', () => {
  let service: RegistrasiTesisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrasiTesisService],
    }).compile();

    service = module.get<RegistrasiTesisService>(RegistrasiTesisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
