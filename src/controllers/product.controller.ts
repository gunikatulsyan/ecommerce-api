import { Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient";
import Joi from "joi";

export const getAllProducts = async (req: any, res: any) => {
  try {
    const {
      limit,
      page,
      name,
      maxPrice,
      minPrice,
      discountedPrice,
      color,
      quantity,
      search,
    } = req.query;
    const currentpage = parseInt(page as string) || 1;
    const currentLimit = parseInt(limit as string) || 10;

    let filterQuery: Prisma.ProductWhereInput = {};

    if (name) {
      filterQuery = { ...filterQuery, name: { contains: name } };
    }

    if (maxPrice) {
      filterQuery = { ...filterQuery, price: { lte: Number(maxPrice) } };
    }

    if (minPrice) {
      filterQuery = { ...filterQuery, price: { gte: Number(minPrice) } };
    }

    if (discountedPrice) {
      filterQuery = {
        ...filterQuery,
        discountedPrice: Number(discountedPrice),
      };
    }

    if (color) {
      filterQuery = { ...filterQuery, color: { contains: color } };
    }

    if (quantity) {
      filterQuery = { ...filterQuery, quantity: Number(quantity) };
    }

    if (search) {
      filterQuery = {
        ...filterQuery,
        OR: [
          { name: { contains: search } },
          { color: { contains: search } },
          { brand: { name: { contains: search } } },
        ],
      };
    }

    const products = await prisma.product.findMany({
      where: filterQuery,
      include: { brand: true, user: true },
      take: currentLimit,
      skip: (currentpage - 1) * currentLimit,
    });
    const totalCount = await prisma.product.count();
    return res
      .status(200)
      .json({ msg: " Product fetched successfully", products, totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const getSingleProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const productexist = await prisma.product.findUnique({ where: { id } });
    if (!productexist)
      return res.status(400).json({ msg: "product not found" });

    const product = await prisma.product.findUnique({ where: { id } });
    return res
      .status(200)
      .json({ msg: "Product fetched successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const createNewProduct = async (req: any, res: any) => {
  try {
    let { name, price, discountedPrice, color, quantity, userId, brandId } =
      req.body;
    const image = req.file.filename;

    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) return res.status(400).json({ msg: "Brand not found" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(400).json({ msg: "user not found" });

    const { error } = productDataValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    let createProductData: Prisma.ProductCreateInput = {
      name,
      price: parseFloat(price),
      discountedPrice: parseFloat(discountedPrice),
      color,
      quantity: parseInt(quantity),
      image,
      user: { connect: { id: userId } },
      brand: { connect: { id: brandId } },
    };

    const product = await prisma.product.create({
      data: createProductData,
    });
    return res
      .status(200)
      .json({ msg: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const updateProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { price, discountedPrice, quantity } = req.body;

    const productexist = await prisma.product.findUnique({ where: { id } });
    if (!productexist)
      return res.status(400).json({ msg: "Product not found" });

    const { error } = productDataValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    let updateProductData: Prisma.ProductUpdateInput = {
      price,
      discountedPrice,
      quantity,
    };

    const product = await prisma.product.update({
      where: { id },
      data: updateProductData,
    });
    return res
      .status(200)
      .json({ mmsg: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const deleteProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(400).json({ msg: "Product not found" });

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

const productDataValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    discountedPrice: Joi.number().required(),
    quantity: Joi.number().required(),
    color: Joi.string().required(),
    brandId: Joi.string().required(),
    userId: Joi.string().required(),
  }).options({ allowUnknown: true });
  return schema.validate(data);
};
