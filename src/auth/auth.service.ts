import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { AxiosError } from "axios";
import { Request } from "express";
import { catchError, firstValueFrom } from "rxjs";
import { AuthDto } from "src/dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(private httpService: HttpService) {}

  async validate(req: Request) {
    const user = await firstValueFrom(
      this.httpService
        .get(`${process.env.AUTH_SERVICE_URL}/auth/self`, {
          headers: {
            Authorization: `Bearer ${req.cookies["gradu-it.access-token"]}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
    );

    return user.data as AuthDto;
  }
}
