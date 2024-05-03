import { RoleEnum } from "src/entities/pengguna.entity";

export const HIGH_AUTHORITY_ROLES = [RoleEnum.ADMIN, RoleEnum.S2_TIM_TESIS];

export function isHighAuthority(roles: RoleEnum[]) {
  return roles.some((role) => HIGH_AUTHORITY_ROLES.includes(role));
}
