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
    isAuthorized: any;
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
    expiresIn: "2d",
  },
  decode: { complete: true },
});

app.addHook("preHandler", (req, reply, next) => {
  req.jwt = app.jwt;
  return next();
});

//auth decorators
app.decorate(
  "authenticate",
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const jwt = await request.jwtVerify();
      if (!jwt) {
        throw new CustomError("Unauthorized", 401);
      }
    } catch (error: any) {
      throw new CustomError(error.message, 500);
    }
  }
);

app.decorate("isAuthorized", async (req: FastifyRequest, res: FastifyReply) => {
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
