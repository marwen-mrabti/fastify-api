import { CustomError } from "../../lib/custom-error";
import { prisma } from "../../lib/prisma";
import { UpdateUserSchema } from "./user.schema";

//?GET ALL USERS SERVICE
export const getUsersService = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        products: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  } finally {
    console.log("disconnecting");
    await prisma.$disconnect();
  }
};

//?GET USER BY ID SERVICE
export const getUserByIdService = async (id: string) => {
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
    return user;
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  } finally {
    console.log("disconnecting");
    await prisma.$disconnect();
  }
};

//?UPDATE USER SERVICE
export const updateUserService = async ({
  id,
  name,
  role,
}: {
  id: string;
  name?: string;
  role?: "USER" | "ADMIN";
}) => {
  if (!id) {
    throw new CustomError("Invalid id", 400);
  }

  // validate the user input
  const validatedUser = UpdateUserSchema.safeParse({
    name,
    role,
  });

  if (!validatedUser.success) {
    const errorMessages: string[] = Object.values(
      validatedUser.error.flatten().fieldErrors
    ).flatMap((msg) => msg);
    throw new CustomError(errorMessages, 400);
  }

  // check if the user exists
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // update the user
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      data: {
        name: name || user.name,
        role: role || user.role,
      },
    });
    return updatedUser;
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  } finally {
    console.log("disconnecting");
    await prisma.$disconnect();
  }
};

//?DELETE USER SERVICE
export const deleteUserService = async (id: string): Promise<void> => {
  // check if the id is valid
  if (!id) {
    throw new CustomError("Invalid id", 400);
  }

  try {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  } finally {
    console.log("disconnecting");
    await prisma.$disconnect();
  }
};
