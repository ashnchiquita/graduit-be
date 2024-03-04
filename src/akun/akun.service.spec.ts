import { Test, TestingModule } from "@nestjs/testing";
import { AkunService } from "./akun.service";

describe("AkunService", () => {
  let service: AkunService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AkunService],
    }).compile();

    service = module.get<AkunService>(AkunService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
