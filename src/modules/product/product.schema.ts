import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  ownerId: z.string().length(24, { message: "invalid ownerId" }),
  title: z
    .string()
    .min(3, { message: "title must be longer than 3 characters" })
    .max(55, { message: "title must be less than 55 characters" }),
  content: z.string().optional(),
  price: z.coerce.number().gt(0, { message: "please provide a valid price" }).default(0),
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
