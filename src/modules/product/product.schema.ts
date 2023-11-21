import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  content: z.string(),
  price: z.coerce.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TProduct = z.infer<typeof ProductSchema>;
export type TCreateProduct = z.infer<typeof CreateProductSchema>;
