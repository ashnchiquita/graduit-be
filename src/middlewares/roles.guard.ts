import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleEnum } from "src/entities/pengguna.entity";
import { ROLES_KEY } from "./roles.decorator";
import { AuthDto } from "src/dto/auth.dto";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { roles } = context.switchToHttp().getRequest().user as AuthDto;

    return requiredRoles.some((role) => roles?.includes(role));
  }
}
