import { FastifyReply, FastifyRequest } from "fastify";
import { CustomError } from "../../lib/custom-error";
import { LoginSchema, TCreateUser, TLogin } from "../user/user.schema";
import { prisma } from "../../lib/prisma";
import { loginUserService, registerUserService } from "../user/user.service";
import { app } from "../../app";

//?CREATE USER
export const registerUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  console.log(request.body);
  const { name, email, password } = request.body as TCreateUser;

  try {
    await registerUserService(request.body as TCreateUser);
    reply.status(201).send({ message: "User created successfully" });
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  }
};

//?LOGIN USER
export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as TLogin;

  try {
    const user = (await loginUserService(email, password)) as {
      id: string;
      email: string;
      name: string;
    };

    //generate the jwt token
    const accessToken = app.jwt.sign({ id: user.id, email: user.email });

    reply
      .status(200)
      .setCookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .send({ message: "Login successful" });
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  } finally {
    await prisma.$disconnect();
  }
};
