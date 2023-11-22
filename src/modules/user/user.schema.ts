import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(15, { message: "Name must be at most 15 characters long" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  products: z.array(z.string()).default([]),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(15, { message: "Name must be at most 15 characters long" })
    .optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER").optional(),
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type TUser = z.infer<typeof UserSchema>;
export type TCreateUser = z.infer<typeof CreateUserSchema>;
export type TLogin = z.infer<typeof LoginSchema>;
