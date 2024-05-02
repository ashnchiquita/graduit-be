import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bimbingan } from "./entities/bimbingan.entity";
import { Pengguna } from "./entities/pengguna.entity";
import { Topik } from "./entities/topik.entity";
import { DosenBimbingan } from "./entities/dosenBimbingan.entity";
import { PendaftaranTesis } from "./entities/pendaftaranTesis.entity";
import { PengujiSidsem } from "./entities/pengujiSidsem.entity";
import { RegistrasiTesisModule } from "./registrasi-tesis/registrasi-tesis.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { AlokasiTopikModule } from "./alokasi-topik/alokasi-topik.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { BimbinganModule } from "./bimbingan/bimbingan.module";
import { validate } from "./env.validation";
import { BerkasBimbingan } from "./entities/berkasBimbingan.entity";
import { PendaftaranSidsem } from "./entities/pendaftaranSidsem";
import { DosenBimbinganModule } from "./dosen-bimbingan/dosen-bimbingan.module";
import { PenggunaModule } from "./pengguna/pengguna.module";
import { KonfigurasiModule } from "./konfigurasi/konfigurasi.module";
import { Konfigurasi } from "./entities/konfigurasi.entity";

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
        DosenBimbingan,
        Konfigurasi,
        PendaftaranTesis,
        PengujiSidsem,
      ],
      synchronize: true,
    }),
    RegistrasiTesisModule,
    AuthModule,
    AlokasiTopikModule,
    DashboardModule,
    BimbinganModule,
    DosenBimbinganModule,
    PenggunaModule,
    KonfigurasiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
