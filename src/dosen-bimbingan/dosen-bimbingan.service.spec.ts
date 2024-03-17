import { Test, TestingModule } from "@nestjs/testing";
import { DosenBimbinganService } from "./dosen-bimbingan.service";

describe("DosenBimbinganService", () => {
  let service: DosenBimbinganService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DosenBimbinganService],
    }).compile();

    service = module.get<DosenBimbinganService>(DosenBimbinganService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
