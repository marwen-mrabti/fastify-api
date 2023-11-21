import { FastifyInstance } from "fastify";
import {
  registerUserHandler,
  getUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from "./user.controllers";

async function userRouter(app: FastifyInstance) {
  app.post("/new", registerUserHandler);
  app.get("/all", getUsersHandler);
  app.get("/:id", getUserByIdHandler);
  app.patch("/edit/:id", updateUserHandler);
  app.delete("/delete/:id", deleteUserHandler);
}

export default userRouter;
