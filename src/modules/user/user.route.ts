import { FastifyInstance } from "fastify";
import {
  getUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from "./user.controllers";

async function userRouter(app: FastifyInstance) {
  app.get("/all", { preHandler: [app.authenticate] }, getUsersHandler);
  app.get(
    "/:id",
    { preHandler: [app.authenticate, app.isAuthorized] },
    getUserByIdHandler
  );
  app.patch(
    "/edit/:id",
    { preHandler: [app.authenticate, app.isAuthorized] },
    updateUserHandler
  );
  app.delete(
    "/delete/:id",
    { preHandler: [app.authenticate, app.isAuthorized] },
    deleteUserHandler
  );
}

export default userRouter;
