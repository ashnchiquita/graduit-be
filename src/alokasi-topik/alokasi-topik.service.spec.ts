import { Test, TestingModule } from "@nestjs/testing";
import { AlokasiTopikService } from "./alokasi-topik.service";

describe("AlokasiTopikService", () => {
  let service: AlokasiTopikService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlokasiTopikService],
    }).compile();

    service = module.get<AlokasiTopikService>(AlokasiTopikService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
