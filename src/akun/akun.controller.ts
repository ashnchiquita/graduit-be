import { Controller, Get, Query } from "@nestjs/common";
import { AkunService } from "./akun.service";

@Controller("akun")
export class AkunController {
  constructor(private akunService: AkunService) {}

  @Get("/")
  findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search: string = "",
  ) {
    return this.akunService.findAll(page, limit, search);
  }
}
