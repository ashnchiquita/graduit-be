import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bimbingan } from "./entities/bimbingan.entity";
import { Pengguna } from "./entities/pengguna.entity";
import { Topik } from "./entities/topik.entity";
import { AuditLog } from "./entities/auditLog.entity";
import { DosenBimbingan } from "./entities/dosenBimbingan.entity";
import { Kelas } from "./entities/kelas.entity";
import { MahasiswaKelas } from "./entities/mahasiswaKelas.entity";
import { PengajarKelas } from "./entities/pengajarKelas.entity";
import { PendaftaranTesis } from "./entities/pendaftaranTesis.entity";
// import { Ruangan } from "./entities/ruangan.entity";
import { Tugas } from "./entities/tugas.entity";
import { PengujiSidsem } from "./entities/pengujiSidsem.entity";
import { RegistrasiTesisModule } from "./registrasi-tesis/registrasi-tesis.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { AlokasiTopikModule } from "./alokasi-topik/alokasi-topik.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { BimbinganModule } from "./bimbingan/bimbingan.module";
import { Konfigurasi } from "./entities/konfigurasi.entity";
import { KonfigurasiModule } from "./konfigurasi/konfigurasi.module";
import { validate } from "./env.validation";
import { BerkasBimbingan } from "./entities/berkasBimbingan.entity";
import { MataKuliah } from "./entities/mataKuliah.entity";
import { SubmisiTugas } from "./entities/submisiTugas.entity";
import { BerkasSubmisiTugas } from "./entities/berkasSubmisiTugas.entity";
import { BerkasTugas } from "./entities/berkasTugas.entity";
import { TugasModule } from "./tugas/tugas.module";
import { KelasModule } from "./kelas/kelas.module";
import { SubmisiTugasModule } from "./submisi-tugas/submisi-tugas.module";
import { NilaiModule } from "./nilai/nilai.module";
import { PendaftaranSidsem } from "./entities/pendaftaranSidsem";
import { DosenBimbinganModule } from "./dosen-bimbingan/dosen-bimbingan.module";

@Module({
  imports: [
    ConfigModule.forRoot({ validate }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      ssl: process.env.POSTGRES_HOST !== "localhost",
      entities: [
        BerkasBimbingan,
        Bimbingan,
        Pengguna,
        PendaftaranSidsem,
        Topik,
        AuditLog,
        DosenBimbingan,
        Kelas,
        MahasiswaKelas,
        PengajarKelas,
        PendaftaranTesis,
        // Ruangan,
        Tugas,
        PengujiSidsem,
        Konfigurasi,
        MataKuliah,
        SubmisiTugas,
        BerkasSubmisiTugas,
        BerkasTugas,
      ],
      synchronize: true,
    }),
    RegistrasiTesisModule,
    AuthModule,
    AlokasiTopikModule,
    DashboardModule,
    BimbinganModule,
    KonfigurasiModule,
    DosenBimbinganModule,
    KelasModule,
    TugasModule,
    SubmisiTugasModule,
    NilaiModule,
    DosenBimbinganModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
