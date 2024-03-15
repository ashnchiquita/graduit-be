import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { Repository } from "typeorm";
import { KonfigurasiDto } from "./konfigurasi.dto";

@Injectable()
export class KonfigurasiService {
  constructor(
    @InjectRepository(Konfigurasi)
    private konfigurasiRepository: Repository<Konfigurasi>,
  ) {}

  async udpateKonfigurasi({ data }: KonfigurasiDto) {
    return await this.konfigurasiRepository.upsert(data, ["key"]);
  }

  async getKonfigurasi(): Promise<KonfigurasiDto> {
    const data = await this.konfigurasiRepository.find();
    return { data };
  }
}
