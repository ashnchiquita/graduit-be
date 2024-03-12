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
} from "@nestjs/common";
import { CreateTopikDto, UpdateTopikDto } from "./alokasi-topik.dto";
import { AlokasiTopikService } from "./alokasi-topik.service";

@Controller("alokasi-topik")
export class AlokasiTopikController {
  constructor(private alokasiTopikService: AlokasiTopikService) {}

  @Post()
  async create(@Body() createDto: CreateTopikDto) {
    return await this.alokasiTopikService.create(createDto);
  }

  @Get("/:id")
  async getById(@Param() params: { id: string }) {
    const res = await this.alokasiTopikService.findById(params.id);
    if (!res) throw new NotFoundException();
    return res;
  }

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

  @Put("/:id")
  async update(
    @Param() params: { id: string },
    @Body() updateDto: UpdateTopikDto,
  ) {
    const res = await this.alokasiTopikService.update(params.id, updateDto);
    if (!res.affected) throw new NotFoundException();
    return res;
  }

  @Delete("/:id")
  async delete(@Param() params: { id: string }) {
    const res = await this.alokasiTopikService.remove(params.id);
    if (!res.affected) throw new NotFoundException();
    return res;
  }
}
