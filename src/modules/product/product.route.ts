import { FastifyInstance } from "fastify";
import {
  createProductHandler,
  deleteProductHandler,
  fetchAllProductsByOwnerHandler,
  fetchAllProductsHandler,
  fetchProductByIdHandler,
  updateProductHandler,
} from "./product.controllers";

async function productRouter(app: FastifyInstance) {
  app.post(
    "/new",
    { preHandler: [app.authenticate, app.isAuthorizedAdmin] },
    createProductHandler
  );
  app.get("/all", fetchAllProductsHandler);
  app.get(
    "/all/:ownerId",
    { preHandler: [app.authenticate, app.isAuthorized] },
    fetchAllProductsByOwnerHandler
  );
  app.get("/:id", fetchProductByIdHandler);
  app.patch(
    "/edit/:id",
    { preHandler: [app.authenticate, app.isAuthorizedAdmin] },
    updateProductHandler
  );
  app.delete(
    "/delete/:id",
    { preHandler: [app.authenticate, app.isAuthorizedAdmin] },
    deleteProductHandler
  );
}

export default productRouter;
