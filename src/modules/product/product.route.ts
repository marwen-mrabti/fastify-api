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
  app.post("/new", createProductHandler); //require user auth
  app.get("/all", fetchAllProductsHandler);
  app.get("/all/:ownerId", fetchAllProductsByOwnerHandler); //require user auth / admin access
  app.get("/:id", fetchProductByIdHandler);
  app.patch("/:id", updateProductHandler); //require user auth
  app.delete("/:id", deleteProductHandler); //require user auth
}

export default productRouter;
