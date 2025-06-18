import { Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient";
import Joi from "joi";

export const getAllCart = async (req: any, res: any) => {
  const { limit, page, quantity, search } = req.query;
  const currentpage = parseInt(page as string) || 1;
  const currentLimit = parseInt(limit as string) || 10;

  let filterQuery: Prisma.CartWhereInput = { userId: req.user.id };

  if (quantity) {
    filterQuery = { ...filterQuery, quantity: Number(quantity) };
  }

  if (search) {
    filterQuery = {
      ...filterQuery,
      OR: [
        { user: { name: { contains: search } } },
        { product: { name: { contains: search } } },
      ],
    };
  }

  const carts = await prisma.cart.findMany({
    where: filterQuery,
    include: { product: true, user: true },
    take: currentLimit,
    skip: (currentpage - 1) * currentLimit,
  });
  const totalCount = await prisma.cart.count();
  return res
    .status(200)
    .json({ msg: " cart fetched successfully", carts, totalCount });
};

export const getSingleCart = async (req: any, res: any) => {
  const { id } = req.params;

  const cartexist = await prisma.cart.findUnique({ where: { id } });
  if (!cartexist) return res.status(400).json({ msg: "cart not found" });

  const cart = await prisma.cart.findUnique({ where: { id } });
  if (!cart)
    return res.status(200).json({ msg: "Product fetched successfully", cart });
};

export const createNewCart = async (req: any, res: any) => {
  let { quantity, userId, productId } = req.body;

  const { error } = cartDataValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(400).json({ msg: "Product not found" });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(400).json({ msg: "user not found" });

  if (quantity > product.quantity) {
    return res
      .status(400)
      .json({ msg: "Requested cart quantity exceeds product quantity" });
  }

  let createCartData: Prisma.CartCreateInput = {
    quantity: parseInt(quantity),
    user: { connect: { id: userId } },
    product: { connect: { id: productId } },
  };

  const cart = await prisma.cart.create({
    data: createCartData,
    include: { user: true, product: true },
  });
  return res.status(200).json({ msg: "Cart created successfully", cart });
};

export const updateCart = async (req: any, res: any) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const cartexist = await prisma.cart.findUnique({ where: { id } });
  if (!cartexist) return res.status(400).json({ msg: "Cart not found" });

  const { error } = cartDataValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  let updateCartData: Prisma.CartUpdateInput = {
    quantity,
  };

  const cart = await prisma.cart.update({
    where: { id },
    data: updateCartData,
  });
  return res.status(200).json({ mmsg: "cart updated successfully", cart });
};

export const deleteCart = async (req: any, res: any) => {
  const { id } = req.params;
  const cart = await prisma.cart.findUnique({ where: { id } });
  if (!cart) return res.status(400).json({ msg: "cart not found" });

  await prisma.cart.delete({ where: { id } });
  return res.status(200).json({ msg: "cart deleted successfully" });
};

const cartDataValidation = (data: any) => {
  const schema = Joi.object({
    quantity: Joi.number().required(),
    productId: Joi.string().required(),
    userId: Joi.string().required(),
  }).options({ allowUnknown: true });
  return schema.validate(data);
};
