import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import helmet from "@fastify/helmet";
import limiter from "@fastify/rate-limit";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fjwt, { JWT } from "@fastify/jwt";

import { CustomError, createGlobalErrorHandler } from "./lib/custom-error";
import userRouter from "./modules/user/user.route";
import productRouter from "./modules/product/product.route";
import authRouter from "./modules/auth/auth.route";

export const app = Fastify({
  logger: true,
});

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  interface FastifyInstance {
    authenticate: any;
  }
}

//security headers
app.register(cors, {});
app.register(helmet, { contentSecurityPolicy: false, global: true });
app.register(limiter, {
  max: 500,
  timeWindow: "1 minute",
});

//check if the server is running
app.get("/health_check", async function handler(request, reply) {
  reply.status(200).send({ status: "ok" });
});

app.register(fastifyCookie);
//jwt
const jwtSecret = process.env.JWT_SECRET as string;
app.register(fjwt, {
  secret: jwtSecret,
  cookie: {
    cookieName: "accessToken",
    signed: false,
  },
  sign: {
    expiresIn: "60m",
  },
});

//auth decorator
app.decorate(
  "authenticate",
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (error: any) {
      throw new CustomError(error.message, 500);
    }
  }
);
app.addHook("preHandler", (req, reply, next) => {
  req.jwt = app.jwt;
  return next();
});

// Run the server!
const startServer = async () => {
  //Error handler
  app.setErrorHandler(createGlobalErrorHandler());
  //declare the routes
  app.register(authRouter, { prefix: "/api/v1/auth" });
  app.register(userRouter, { prefix: "/api/v1/users" });
  app.register(productRouter, { prefix: "/api/v1/products" });

  try {
    await app.listen(8081, "0.0.0.0");
    app.log.info(`server listening on port 8081`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

//start the server
startServer();
