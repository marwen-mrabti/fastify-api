import { FastifyReply, FastifyRequest } from "fastify";
import { CustomError } from "./custom-error";

export const isAuthorizedHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const token = req.cookies.accessToken as string;
    const decodeToken = req.jwt.decode(token) as {
      payload: { id: string; email: string; iat: number; exp: number };
    };
    const user = decodeToken.payload;
    req.user = user;
  } catch (error: any) {
    throw new CustomError(error.message, 401);
  }
};

export const isAuthorizedAdminHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const token = req.cookies.accessToken as string;
    const decodeToken = req.jwt.decode(token) as {
      payload: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
        iat: number;
        exp: number;
      };
    };
    const user = decodeToken.payload;
    if (user.role !== "ADMIN") {
      throw new CustomError("Unauthorized", 401);
    }
    req.user = user;
  } catch (error: any) {
    throw new CustomError(error.message, 401);
  }
};
