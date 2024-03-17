import { Test, TestingModule } from "@nestjs/testing";
import { DosenBimbinganController } from "./dosen-bimbingan.controller";

describe("DosenBimbinganController", () => {
  let controller: DosenBimbinganController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DosenBimbinganController],
    }).compile();

    controller = module.get<DosenBimbinganController>(DosenBimbinganController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
