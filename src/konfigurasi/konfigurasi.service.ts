import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { Repository } from "typeorm";
import { KonfigurasiArrDto } from "./konfigurasi.dto";

@Injectable()
export class KonfigurasiService {
  constructor(
    @InjectRepository(Konfigurasi)
    private konfigurasiRepository: Repository<Konfigurasi>,
  ) {}

  async updateKonfigurasi({ data }: KonfigurasiArrDto) {
    return await this.konfigurasiRepository.upsert(data, ["key"]);
  }

  async getKonfigurasi(): Promise<KonfigurasiArrDto> {
    const data = await this.konfigurasiRepository.find();
    return { data };
  }

  async getKonfigurasiByKey(key: string): Promise<string | undefined> {
    const data = await this.konfigurasiRepository.findOne({
      where: {
        key,
      },
    });

    return data?.value;
  }

  async getPeriodeOrFail() {
    const currPeriod = await this.getKonfigurasiByKey(
      process.env.KONF_PERIODE_KEY,
    );

    if (!currPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi");
    }

    return currPeriod;
  }
}
