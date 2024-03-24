import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, Repository } from "typeorm";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(PendaftaranTesis)
    private readonly pendaftaranRepository: Repository<PendaftaranTesis>,
  ) {}

  async approvePendaftaran(
    id: string,
    status: RegStatus,
  ): Promise<PendaftaranTesis> {
    try {
      const findOneOptions: FindOneOptions<PendaftaranTesis> = {
        where: { id },
      };
      const pendaftaran =
        await this.pendaftaranRepository.findOneOrFail(findOneOptions);
      pendaftaran.status = status;

      return await this.pendaftaranRepository.save(pendaftaran);
    } catch (error) {
      throw new Error("Pendaftaran not found");
    }
  }
}
