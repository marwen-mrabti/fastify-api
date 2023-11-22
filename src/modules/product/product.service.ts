import { CustomError } from "../../lib/custom-error";
import { prisma } from "../../lib/prisma";
import { CreateProductSchema, TCreateProduct, TProduct } from "./product.schema";

export const createProduct = async (product: TCreateProduct) => {
  try {
    //validate product entries
    const validatedProduct = CreateProductSchema.safeParse(product);

    if (!validatedProduct.success) {
      const errorMessages: string[] = Object.values(
        validatedProduct.error.flatten().fieldErrors
      ).flatMap((msg) => msg);
      throw new CustomError(errorMessages, 400);
    }

    const newProduct = await prisma.product.create({ data: product });
    return newProduct;
  } catch (error: any) {
    throw new CustomError(error.message, 500);
  } finally {
    await prisma.$disconnect();
  }
};

type TProductWithOwner = TProduct & { owner: { email: string; name: string } };

export const fetchAllProducts = async (
  ownerId?: string
): Promise<TProductWithOwner[] | []> => {
  try {
    const whereClause = ownerId ? { ownerId } : {};
    const selectClause = {
      id: true,
      title: true,
      content: true,
      price: true,
      ownerId: false,
      owner: {
        select: {
          email: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    };
    const products = (await prisma.product.findMany({
      where: whereClause,
      select: selectClause,
      orderBy: {
        createdAt: "desc",
      },
    })) as TProductWithOwner[];
    return products;
  } catch (error) {
    throw new CustomError("Error fetching products", 500);
  } finally {
    await prisma.$disconnect();
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const product = (await prisma.product.findUnique({
      where: { id },
    })) as TProduct;
    return product;
  } catch (error) {
    throw new CustomError("Error fetching product", 500);
  } finally {
    await prisma.$disconnect();
  }
};
