import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bimbingan } from "./entities/bimbingan.entity";
import { Pengguna } from "./entities/pengguna.entity";
import { RangeJadwalSeminar } from "./entities/rangeJadwalSeminar.entity";
import { Seminar } from "./entities/seminar.entity";
import { Topik } from "./entities/topik.entity";
import { AuditLog } from "./entities/auditLog.entity";
import { DosenBimbingan } from "./entities/dosenBimbingan.entity";
import { Kelas } from "./entities/kelas.entity";
import { MahasiswaKelas } from "./entities/mahasiswaKelas";
import { PengajarKelas } from "./entities/pengajarKelas.entity";
import { PendaftaranTesis } from "./entities/pendaftaranTesis.entity";
import { RangeJadwalSidang } from "./entities/rangeJadwalSidang.entity";
import { Ruangan } from "./entities/ruangan.entity";
import { Sidang } from "./entities/sidang.entity";
import { Tugas } from "./entities/tugas.entity";
import { PembimbingSeminar } from "./entities/pembimbingSeminar.entity";
import { PembimbingSidang } from "./entities/pembimbingSidang.entity";
import { PengujiSidang } from "./entities/pengujiSidang.entity";
import { RegistrasiTesisModule } from "./registrasi-tesis/registrasi-tesis.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { AlokasiTopikModule } from "./alokasi-topik/alokasi-topik.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { BimbinganModule } from "./bimbingan/bimbingan.module";
import { Konfigurasi } from "./entities/konfigurasi.entity";
import { KonfigurasiModule } from "./konfigurasi/konfigurasi.module";
import { validate } from "./env.validation";
import { BerkasBimbingan } from "./entities/berkasBimbingan";
import { MataKuliah } from "./entities/mataKuliah";
import { SubmisiTugas } from "./entities/submisiTugas";
import { KelasModule } from "./kelas/kelas.module";
import { BerkasSubmisiTugas } from "./entities/berkasSubmisiTugas";
import { BerkasTugas } from "./entities/berkasTugas";
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
        RangeJadwalSeminar,
        Seminar,
        Topik,
        AuditLog,
        DosenBimbingan,
        Kelas,
        MahasiswaKelas,
        PengajarKelas,
        PendaftaranTesis,
        RangeJadwalSidang,
        Ruangan,
        Sidang,
        Tugas,
        PembimbingSeminar,
        PembimbingSidang,
        PengujiSidang,
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
    DosenBimbinganModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
