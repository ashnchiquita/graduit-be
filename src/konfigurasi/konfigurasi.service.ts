import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Konfigurasi,
  KonfigurasiKeyEnum,
} from "src/entities/konfigurasi.entity";
import { Repository } from "typeorm";
import { KonfigurasiArrDto, UpdateKonfigurasiResDto } from "./konfigurasi.dto";

@Injectable()
export class KonfigurasiService {
  constructor(
    @InjectRepository(Konfigurasi)
    private konfigurasiRepository: Repository<Konfigurasi>,
  ) {}

  async updateKonfigurasi({
    data,
  }: KonfigurasiArrDto): Promise<UpdateKonfigurasiResDto> {
    await this.konfigurasiRepository.upsert(data, ["key"]);
    const res = {
      keys: data.map((d) => d.key),
    };
    return res;
  }

  async getKonfigurasi(): Promise<KonfigurasiArrDto> {
    const data = await this.konfigurasiRepository.find();

    return { data };
  }

  async getKonfigurasiByKey(
    key: KonfigurasiKeyEnum,
  ): Promise<string | undefined> {
    const data = await this.konfigurasiRepository.findOne({
      where: {
        key,
      },
    });

    return data?.value;
  }
}
