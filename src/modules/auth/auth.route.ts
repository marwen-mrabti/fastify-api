import { FastifyInstance } from "fastify";
import { loginHandler, registerUserHandler } from "./auth.controller";

async function authRouter(app: FastifyInstance) {
  app.post("/login", loginHandler);
  app.post("/register", registerUserHandler);
  // app.post("/logout", logoutHandler)
}

export default authRouter;
