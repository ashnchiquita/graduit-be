import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuditLog } from "./entities/auditLog.entity";
import { Bimbingan } from "./entities/bimbingan.entity";
import { DosenBimbingan } from "./entities/dosenBimbingan.entity";
import { Kelas } from "./entities/kelas.entity";
import { MahasiswaKelas } from "./entities/mahasiswaKelas.entity";
import { PendaftaranTesis } from "./entities/pendaftaranTesis.entity";
import { PengajarKelas } from "./entities/pengajarKelas.entity";
import { Pengguna } from "./entities/pengguna.entity";
import { Topik } from "./entities/topik.entity";
// import { Ruangan } from "./entities/ruangan.entity";
import { ConfigModule } from "@nestjs/config";
import { AlokasiRuanganModule } from "./alokasi-ruangan/alokasi-ruangan.module";
import { AlokasiTopikModule } from "./alokasi-topik/alokasi-topik.module";
import { AuthModule } from "./auth/auth.module";
import { BimbinganModule } from "./bimbingan/bimbingan.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DosenBimbinganModule } from "./dosen-bimbingan/dosen-bimbingan.module";
import { BerkasBimbingan } from "./entities/berkasBimbingan.entity";
import { BerkasSubmisiTugas } from "./entities/berkasSubmisiTugas.entity";
import { BerkasTugas } from "./entities/berkasTugas.entity";
import { Konfigurasi } from "./entities/konfigurasi.entity";
import { MataKuliah } from "./entities/mataKuliah.entity";
import { PendaftaranSidsem } from "./entities/pendaftaranSidsem";
import { PengujiSidsem } from "./entities/pengujiSidsem.entity";
import { SubmisiTugas } from "./entities/submisiTugas.entity";
import { Tugas } from "./entities/tugas.entity";
import { validate } from "./env.validation";
import { KelasModule } from "./kelas/kelas.module";
import { KonfigurasiModule } from "./konfigurasi/konfigurasi.module";
import { NilaiModule } from "./nilai/nilai.module";
import { RegistrasiTesisModule } from "./registrasi-tesis/registrasi-tesis.module";
import { SubmisiTugasModule } from "./submisi-tugas/submisi-tugas.module";
import { TugasModule } from "./tugas/tugas.module";

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
    KelasModule,
    TugasModule,
    SubmisiTugasModule,
    NilaiModule,
    DosenBimbinganModule,
    AlokasiRuanganModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
