import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendaftaranTesis } from "src/entities/pendaftaranTesis.entity";
import { ApprovalController } from "./approval.controller";
import { ApprovalService } from "./approval.service";

@Module({
  imports: [TypeOrmModule.forFeature([PendaftaranTesis])],
  controllers: [ApprovalController],
  providers: [ApprovalService],
})
export class ApprovalModule {}
