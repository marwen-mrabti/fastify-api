import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../lib/prisma";

import { format } from "date-fns";
import { CustomError } from "../../lib/custom-error";
import {
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
} from "./user.service";

//?GET ALL USERS
export const getUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await getUsersService();
    reply.status(200).send({ users });
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  }
};

//?GET USER BY ID
export const getUserByIdHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  //check if the id is valid
  if (!id) {
    throw new CustomError("Invalid id", 400);
  }

  try {
    const user = await getUserByIdService(id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    reply.status(200).send({
      ...user,
      createdAt: format(user.createdAt, "dd-MM-yyyy"),
      updatedAt: format(user.updatedAt, "dd-MM-yyyy"),
    });
  } catch (error: any) {
    console.log(error.message);
    throw new CustomError(error.message, 500);
  } finally {
    console.log("disconnecting");
    await prisma.$disconnect();
  }
};

//?UPDATE USER
export const updateUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { name, role } = request.body as {
    name?: string;
    role: "USER" | "ADMIN";
  };
  const currentUser = request.user as {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
  };

  if (currentUser.id !== id && currentUser.role !== "ADMIN") {
    throw new CustomError("Unauthorized", 401);
  }

  try {
    const updatedUser = await updateUserService({ id, name, role });

    if (!updatedUser) {
      throw new CustomError("User not found", 404);
    }

    reply.status(200).send({
      ...updatedUser,
      createdAt: format(updatedUser.createdAt, "dd-MM-yyyy"),
      updatedAt: format(updatedUser.updatedAt, "dd-MM-yyyy"),
    });
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  }
};

//?DELETE USER
export const deleteUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const currentUser = request.user as {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
  };

  if (currentUser.id !== id && currentUser.role !== "ADMIN") {
    throw new CustomError("Unauthorized", 401);
  }

  try {
    await deleteUserService(id);
    reply.status(200).send({ message: "User deleted successfully" });
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  }
};
