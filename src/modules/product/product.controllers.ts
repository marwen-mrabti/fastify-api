import { FastifyReply, FastifyRequest } from "fastify";
import { TCreateProduct, TProduct } from "./product.schema";
import { createProduct, fetchAllProducts } from "./product.service";
import { CustomError } from "../../lib/custom-error";

export const createProductHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { ownerId, title, content, price } = req.body as TCreateProduct;

    const product = (await createProduct({ ownerId, title, content, price })) as TProduct;
    return reply.status(201).send(product);
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  }
};

export const fetchAllProductsHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const products = await fetchAllProducts();
    return reply.status(200).send(products);
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  }
};

export const fetchAllProductsByOwnerHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { ownerId } = req.params as { ownerId: string };

    const products = await fetchAllProducts(ownerId);
    return reply.status(200).send(products);
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  }
};

export const fetchProductByIdHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  return reply.status(200).send("Product by id");
};

export const updateProductHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send("Update product by id");
};

export const deleteProductHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send("Delete product by id");
};
