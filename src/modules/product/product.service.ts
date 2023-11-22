import { off } from "process";
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
  // offset?: number
  // ITEMS_PER_PAGE?: number
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
      // skip:offset,
      // take: ITEMS_PER_PAGE,
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

export const deleteProduct = async (id: string) => {
  try {
    //check if the product exists
    const product = await fetchProductById(id);
    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    //if the product had an image, delete it from public folder
    /*  if (product.image) {
        //check if the image exists
        const imagePath = path.join(__dirname, `../../../public/images/${product.image}`);
        await fs.promises.access(imagePath, fs.constants.F_OK);
        //delete the image
        fs.unlinkSync(imagePath);
      }
    */
    await prisma.product.delete({ where: { id } });
    return;
  } catch (error) {
    throw new CustomError("Error deleting product", 500);
  } finally {
    prisma.$disconnect();
  }
};
