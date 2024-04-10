import { Controller, Patch, Param, UseGuards } from "@nestjs/common";
import { ApprovalService } from "./approval.service";
import {
  PendaftaranTesis,
  RegStatus,
} from "src/entities/pendaftaranTesis.entity";
import { CustomAuthGuard } from "src/middlewares/custom-auth.guard";
import { RolesGuard } from "src/middlewares/roles.guard";
import { RoleEnum } from "src/entities/pengguna.entity";
import { Roles } from "src/middlewares/roles.decorator";
import { ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ByIdParamDto } from "./approval.dto";

@ApiTags("Approval")
@ApiCookieAuth()
@Controller("approval")
@UseGuards(CustomAuthGuard, RolesGuard)
@Roles(RoleEnum.S2_PEMBIMBING)
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @ApiOkResponse({ type: PendaftaranTesis })
  @Patch(":id/approve")
  async approvePendaftaran(
    @Param() param: ByIdParamDto,
  ): Promise<PendaftaranTesis> {
    return this.approvalService.approvePendaftaran(
      param.id,
      RegStatus.APPROVED,
    );
  }

  @ApiOkResponse({ type: PendaftaranTesis })
  @Patch(":id/reject")
  async declinePendaftaran(
    @Param() param: ByIdParamDto,
  ): Promise<PendaftaranTesis> {
    return this.approvalService.approvePendaftaran(
      param.id,
      RegStatus.REJECTED,
    );
  }

  @ApiOkResponse({ type: PendaftaranTesis })
  @Patch(":id/interview")
  async interviewPendaftaran(
    @Param() param: ByIdParamDto,
  ): Promise<PendaftaranTesis> {
    return this.approvalService.approvePendaftaran(
      param.id,
      RegStatus.INTERVIEW,
    );
  }
}
