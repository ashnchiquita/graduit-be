import { Test, TestingModule } from "@nestjs/testing";
import { AlokasiTopikController } from "./alokasi-topik.controller";

describe("AlokasiTopikController", () => {
  let controller: AlokasiTopikController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlokasiTopikController],
    }).compile();

    controller = module.get<AlokasiTopikController>(AlokasiTopikController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
