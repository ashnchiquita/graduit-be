import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Put,
  Query,
} from "@nestjs/common";
import { DosenBimbinganService } from "./dosen-bimbingan.service";
import {
  DosbimOptQueryDto,
  DosbimQueryDto,
  UpdateDosbimDto,
} from "./dosen-bimbingan.dto";

@Controller("dosen-bimbingan")
export class DosenBimbinganController {
  constructor(private readonly dosbimService: DosenBimbinganService) {}

  @Get()
  async get(@Query() query: DosbimOptQueryDto) {
    if (!query.regId) return await this.dosbimService.getAll();

    const res = await this.dosbimService.findByRegId(query.regId);
    const mappedRes = res.map((r) => r.dosen);
    return mappedRes;
  }

  @Put()
  async updateByRegId(
    @Query() query: DosbimQueryDto,
    @Body() body: UpdateDosbimDto,
  ) {
    await this.dosbimService.updateByRegId(query.regId, body.dosbimIds);

    return {
      status: "ok",
    };
  }

  @Delete()
  async deleteByRegId(@Query() query: DosbimQueryDto) {
    const res = await this.dosbimService.removeByRegId(query.regId);

    if (!res.affected) throw new NotFoundException();

    return {
      status: "ok",
    };
  }
}
