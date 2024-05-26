import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-custom";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, "custom") {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request) {
    let token = "";

    if (req?.cookies?.[process.env.COOKIE_NAME]) {
      token = req.cookies[process.env.COOKIE_NAME];
    }

    if (req.headers?.authorization) {
      token = req.headers.authorization.slice(7);
    }

    return this.authService.validate(token);
  }
}
