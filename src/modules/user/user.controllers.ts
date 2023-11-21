import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../lib/prisma";
import { CreateUserSchema } from "./user.schema";

import { format } from "date-fns";
import { hashPassword } from "../../lib/utils";

export const registerUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, email, password } = request.body as {
    name: string;
    email: string;
    password: string;
  };

  //validate the user input
  const validatedUser = CreateUserSchema.safeParse({
    name,
    email,
    password,
  });

  if (!validatedUser.success) {
    console.log(validatedUser.error.flatten().fieldErrors);
    reply.status(400).send({ error: validatedUser.error.flatten().fieldErrors });
    return;
  }

  //check if the user already exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    reply.status(400).send({ error: "User already exists" });
    return;
  }

  //hash the password
  const hashedPassword = await hashPassword(password);

  //create the user
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    reply.status(201).send({ message: "user created successfully" });
  } catch (error: any) {
    console.log(error.message);
    reply.status(500).send({ error: "Something went wrong" });
  }
};

export const getUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    reply.status(200).send({ users });
  } catch (error: any) {
    console.log(error.message);
    reply.status(500).send({ error: "Something went wrong" });
  }
};

export const getUserByIdHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  //check if the id is valid
  if (!id) {
    reply.status(400).send({ error: "Invalid id" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      reply.status(404).send({ error: "User not found" });
      return;
    }

    reply.status(200).send({
      ...user,
      createdAt: format(user.createdAt, "dd-MM-yyyy"),
      updatedAt: format(user.updatedAt, "dd-MM-yyyy"),
    });
  } catch (error: any) {
    console.log(error.message);
    reply.status(500).send({ error: "Something went wrong" });
  }
};

export const updateUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {};

export const deleteUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {};
