import { Test, TestingModule } from "@nestjs/testing";
import { RegistrasiTesisController } from "./registrasi-tesis.controller";

describe("RegistrasiTesisController", () => {
  let controller: RegistrasiTesisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrasiTesisController],
    }).compile();

    controller = module.get<RegistrasiTesisController>(
      RegistrasiTesisController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
