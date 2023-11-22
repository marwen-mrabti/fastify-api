import { CustomError } from "../../lib/custom-error";
import { prisma } from "../../lib/prisma";
import { comparePassword, hashPassword } from "../../lib/utils";
import { CreateUserSchema, LoginSchema, TCreateUser } from "../user/user.schema";

//?CREATE USER SERVICE
export const registerUserService = async (reqBody: TCreateUser) => {
  //validate the user input
  const validatedUser = CreateUserSchema.safeParse({
    ...reqBody,
  });

  if (!validatedUser.success) {
    const errorMessages: string[] = Object.values(
      validatedUser.error.flatten().fieldErrors
    ).flatMap((msg) => msg);
    throw new CustomError(errorMessages, 400);
  }

  const { name, email, password, role } = validatedUser.data;
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
        role,
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
      role: user.role,
    };
  } catch (error: any) {
  } finally {
    await prisma.$disconnect();
  }
};
