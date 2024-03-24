import { Controller, Patch, Param, UseGuards } from "@nestjs/common";
import { ApprovalService } from "./approval.service";
import { RegStatus } from "src/entities/pendaftaranTesis.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";

@Controller("approval")
@UseGuards(CustomAuthGuard, RolesGuard)
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Roles(RoleEnum.S2_PEMBIMBING)
  @Patch(":id/approve")
  async approvePendaftaran(@Param("id") id: string) {
    return this.approvalService.approvePendaftaran(id, RegStatus.APPROVED);
  }

  @Roles(RoleEnum.S2_PEMBIMBING)
  @Patch(":id/reject")
  async declinePendaftaran(@Param("id") id: string) {
    return this.approvalService.approvePendaftaran(id, RegStatus.REJECTED);
  }

  @Roles(RoleEnum.S2_PEMBIMBING)
  @Patch(":id/interview")
  async interviewPendaftaran(@Param("id") id: string) {
    return this.approvalService.approvePendaftaran(id, RegStatus.INTERVIEW);
  }
}
