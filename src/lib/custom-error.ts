import { FastifyRequest, FastifyReply } from "fastify";

export class CustomError extends Error {
  statusCode?: number;

  constructor(message: string | string[], statusCode?: number) {
    if (Array.isArray(message)) {
      message = `[${message.join(" , ")}]`;
    }
    super(message);
    this.statusCode = statusCode;
  }
}

type ErrorHandler = (
  error: CustomError,
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void> | void;

export function createGlobalErrorHandler(): ErrorHandler {
  return async (error: CustomError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "An unexpected error occurred.";

    reply.status(statusCode).send({
      error: {
        statusCode,
        message,
      },
    });
  };
}
