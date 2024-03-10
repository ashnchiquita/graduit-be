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
    return this.authService.validate(req);
  }
}
