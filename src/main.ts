import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { ForbiddenExceptionFilter } from "./middlewares/forbidden-exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new ForbiddenExceptionFilter());

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FE_URL,
    credentials: true,
  });

  const options = new DocumentBuilder()
    .setTitle("GraduIT S2 API")
    .setDescription("GraduIT API Documentation for S2 services")
    .setVersion("1.0")
    .addTag("Alokasi Topik")
    .addTag("Approval")
    .addTag("Bimbingan")
    .addTag("Dashboard")
    .addTag("Dosen Bimbingan")
    .addTag("Kelas")
    .addTag("Konfigurasi")
    .addTag("Nilai")
    .addTag("Registrasi Tesis")
    .addTag("Submisi Tugas")
    .addTag("Tugas")
    .addCookieAuth(process.env.COOKIE_NAME)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(3000);
}
bootstrap();
