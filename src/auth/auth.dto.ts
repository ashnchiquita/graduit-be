import { RoleEnum } from "src/entities/pengguna.entity";

export class AuthDto {
  id: string;
  nama: string;
  email: string;
  roles: RoleEnum[];
}
