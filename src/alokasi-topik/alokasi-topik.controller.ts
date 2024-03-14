import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateTopikDto, UpdateTopikDto } from "./alokasi-topik.dto";
import { AlokasiTopikService } from "./alokasi-topik.service";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { Roles } from "src/middlewares/roles.decorator";
import { RoleEnum } from "src/entities/pengguna.entity";

@Controller("alokasi-topik")
@UseGuards(CustomAuthGuard, RolesGuard)
export class AlokasiTopikController {
  constructor(private alokasiTopikService: AlokasiTopikService) {}

  @Roles(RoleEnum.S2_TIM_TESIS)
  @Post()
  async create(@Body() createDto: CreateTopikDto) {
    return await this.alokasiTopikService.create(createDto);
  }

  @Roles(RoleEnum.S2_TIM_TESIS)
  @Get("/:id")
  async getById(@Param() params: { id: string }) {
    const res = await this.alokasiTopikService.findById(params.id);
    if (!res) throw new NotFoundException();
    return res;
  }

  @Roles(RoleEnum.S2_TIM_TESIS)
  @Get()
  async getAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      idPembimbing?: string;
    },
  ) {
    return await this.alokasiTopikService.findAllCreatedByPembimbing({
      page: query.page || 1,
      ...query,
    });
  }

  @Roles(RoleEnum.S2_TIM_TESIS)
  @Put("/:id")
  async update(
    @Param() params: { id: string },
    @Body() updateDto: UpdateTopikDto,
  ) {
    const res = await this.alokasiTopikService.update(params.id, updateDto);
    if (!res.affected) throw new NotFoundException();
    return res;
  }

  @Roles(RoleEnum.S2_TIM_TESIS)
  @Delete("/:id")
  async delete(@Param() params: { id: string }) {
    const res = await this.alokasiTopikService.remove(params.id);
    if (!res.affected) throw new NotFoundException();
    return res;
  }
}
