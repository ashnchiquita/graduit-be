import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from "@nestjs/common";
import { Response } from "express";

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response
      .clearCookie(process.env.COOKIE_NAME)
      .status(status)
      .json(exception.getResponse());
  }
}
