import { ArgumentsHost, Catch, HttpStatus } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "@prisma/client";
import { Response } from "express";

// taken from https://www.prisma.io/blog/nestjs-prisma-error-handling-7D056s1kOop2

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const message = exception.message.replace(/\n/g, "");

		switch (exception.code) {
			// map Prisma error codes to HTTP status codes - here only not found will be thrown
			// all prisma codes - https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
			case "P2025": {
				const status = HttpStatus.NOT_FOUND;
				response.status(status).json({
					statusCode: status,
					message: message,
				});
				break;
			}
			default:
				// default 500 error code
				super.catch(exception, host);
				break;
		}
	}
}
