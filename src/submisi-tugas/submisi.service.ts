import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthDto } from "src/auth/auth.dto";
import {
  CreateSubmisiReqDto,
  CreateSubmisiResDto,
  GetSubmisiResDto,
} from "src/submisi-tugas/submisi.dto";

// Entities
import { SubmisiTugas } from "src/entities/submisiTugas";
import { Tugas } from "src/entities/tugas.entity";
import { MahasiswaKelas } from "src/entities/mahasiswaKelas";
import { Konfigurasi } from "src/entities/konfigurasi.entity";
import { RoleEnum } from "src/entities/pengguna.entity";
import { BerkasSubmisiTugas } from "src/entities/berkasSubmisiTugas";

@Injectable()
export class SubmisiService {
  constructor(
    @InjectRepository(SubmisiTugas)
    private submisiRepository: Repository<SubmisiTugas>,
    @InjectRepository(Tugas)
    private tugasRepository: Repository<Tugas>,
    @InjectRepository(MahasiswaKelas)
    private mahasiswaRepository: Repository<MahasiswaKelas>,
    @InjectRepository(Konfigurasi)
    private konfigurasiRepository: Repository<Konfigurasi>,
    @InjectRepository(BerkasSubmisiTugas)
    private berkasSubmisiTugasRepository: Repository<BerkasSubmisiTugas>,
  ) {}

  async getSubmisiMahasiswaByTugasId(
    mahasiswaId: string,
    tugasId: string,
    user: AuthDto,
  ): Promise<GetSubmisiResDto> {
    // Validate user
    if (!user.roles.includes(RoleEnum.S2_MAHASISWA)) {
      throw new ForbiddenException();
    }

    // Validate mahasiswa
    const mahasiswa = await this.mahasiswaRepository.findOne({
      where: { id: mahasiswaId },
    });

    if (!mahasiswa) {
      throw new NotFoundException("Mahasiswa not found");
    }

    // Validate tugas
    const currentPeriod = await this.konfigurasiRepository.findOne({
      where: { key: process.env.KONF_PERIODE_KEY },
    });

    if (!currentPeriod) {
      throw new BadRequestException("Periode belum dikonfigurasi.");
    }

    // Get tugas where class is in current period
    const tugas = await this.tugasRepository.findOne({
      where: {
        id: tugasId,
        kelas: {
          periode: currentPeriod.value,
        },
      },
    });

    if (!tugas) {
      throw new NotFoundException("Tugas kelas tidak ditemukan.");
    }

    // Get submission
    const submisi = await this.submisiRepository.findOne({
      where: {
        mahasiswa: { id: mahasiswaId },
        tugas: { id: tugasId },
      },
    });

    return { submisi };
  }

  async createSubmission(
    createSubmisiDto: CreateSubmisiReqDto,
    user: AuthDto,
  ): Promise<CreateSubmisiResDto> {
    // Validate user
    if (!user.roles.includes(RoleEnum.S2_MAHASISWA)) {
      throw new ForbiddenException();
    }

    // Validate tugas
    const tugas = await this.tugasRepository.findOne({
      where: { id: createSubmisiDto.tugas },
    });

    if (!tugas) {
      throw new NotFoundException("Tugas tidak ditemukan.");
    }

    // Validate mahasiswa
    const mahasiswa = await this.mahasiswaRepository.findOne({
      where: { id: user.id },
    });

    if (!mahasiswa) {
      throw new NotFoundException("Mahasiswa tidak ditemukan.");
    }

    // Validate submission if isSubmitted is true
    const submisi = await this.submisiRepository.findOne({
      where: {
        mahasiswa: { id: user.id },
        tugas: { id: createSubmisiDto.tugas },
        isSubmitted: true,
      },
    });

    if (submisi) {
      throw new BadRequestException("Tugas sudah dikumpulkan.");
    }

    // Create submission
    // If isSubmitted is true, set submittedAt to current date
    const submittedAt = createSubmisiDto.isSubmitted ? new Date() : null;

    // Create the berkasSubmisiTugas
    const berkasSubmisiTugas = await Promise.all(
      createSubmisiDto.berkasSubmisiTugas.map(async (berkas) => {
        const newBerkas = this.berkasSubmisiTugasRepository.create({
          nama: berkas.nama,
          url: berkas.url,
        });

        await this.berkasSubmisiTugasRepository.save(newBerkas);
        return newBerkas;
      }),
    );

    await this.submisiRepository.insert({
      mahasiswa: mahasiswa,
      tugas: tugas,
      jawaban: createSubmisiDto.jawaban,
      isSubmitted: createSubmisiDto.isSubmitted,
      berkasSubmisiTugas: berkasSubmisiTugas,
      submittedAt: submittedAt,
    });

    return { message: "Submission created" };
  }
}
