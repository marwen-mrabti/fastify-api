import { CustomError } from "../../lib/custom-error";
import { prisma } from "../../lib/prisma";
import { comparePassword, hashPassword } from "../../lib/utils";
import {
  CreateUserSchema,
  LoginSchema,
  TCreateUser,
  UpdateUserSchema,
} from "./user.schema";

//?CREATE USER SERVICE
export const registerUserService = async ({ name, email, password }: TCreateUser) => {
  //validate the user input
  const validatedUser = CreateUserSchema.safeParse({
    name,
    email,
    password,
  });

  if (!validatedUser.success) {
    const errorMessages: string[] = Object.values(
      validatedUser.error.flatten().fieldErrors
    ).flatMap((msg) => msg);
    throw new CustomError(errorMessages, 400);
  }

  //check if the user already exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    throw new CustomError("User already exists", 400);
  }

  //hash the password
  const hashedPassword = await hashPassword(password);

  //create the user
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return;
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  } finally {
    console.log("disconnecting");
    await prisma.$disconnect();
  }
};

//?LOGIN USER SERVICE
export const loginUserService = async (email: string, password: string) => {
  try {
    //validate the login data
    const validateLogin = LoginSchema.safeParse({ email, password });
    if (!validateLogin.success) {
      const errorMessages: string[] = Object.values(
        validateLogin.error.flatten().fieldErrors
      ).flatMap((msg) => msg);
      throw new CustomError(errorMessages, 400);
    }

    //check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new CustomError("Couldn't find a User with this email", 401);
    }

    //check if the password matches
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new CustomError("Invalid Credentials", 401);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error: any) {
  } finally {
    await prisma.$disconnect();
  }
};
//?GET ALL USERS SERVICE
export const getUsersService = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
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
export const updateUserService = async (id: string, name?: string, email?: string) => {
  if (!id) {
    throw new CustomError("Invalid id", 400);
  }

  // validate the user input
  const validatedUser = UpdateUserSchema.safeParse({
    name,
    email,
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
        createdAt: true,
        updatedAt: true,
      },
      data: {
        name: name || user.name,
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
