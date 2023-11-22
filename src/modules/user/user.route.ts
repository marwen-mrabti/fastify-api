import { FastifyInstance } from "fastify";
import {
  getUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from "./user.controllers";

async function userRouter(app: FastifyInstance) {
  app.get("/all", { preHandler: [app.authenticate] }, getUsersHandler);
  app.get("/:id", getUserByIdHandler);
  app.patch("/edit/:id", updateUserHandler);
  app.delete("/delete/:id", deleteUserHandler);
}

export default userRouter;
