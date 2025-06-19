import { Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient";
import Joi from "joi";

export const getAllCart = async (req: any, res: any) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const getSingleCart = async (req: any, res: any) => {
try{
  const { id } = req.params;

  const cartexist = await prisma.cart.findUnique({ where: { id } });
  if (!cartexist) return res.status(400).json({ msg: "cart not found" });

  const cart = await prisma.cart.findUnique({ where: { id } });
  if (!cart)
    return res.status(200).json({ msg: "Cart fetched successfully", cart });
}catch(error)
{
  console.error(error);
  res.status(500).json({ error });
}
};

export const addToCart = async (req: any, res: any) => {
  try{
  let { quantity, productId } = req.body;

  const { error } = cartDataValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(400).json({ msg: "Product not found" });

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(400).json({ msg: "user not found" });

  if (quantity > product.quantity) {
    return res
      .status(400)
      .json({ msg: "Requested cart quantity exceeds product quantity" });
  }

  const cartExist = await prisma.cart.findUnique({
    where: { id: productId, userId: req.user.id },
  });
  if (cartExist) {
    const cartUpdate = await prisma.cart.update({
      where: { id: cartExist.id },
      data: { quantity: parseInt(quantity) },
    });
    return res.status(200).json({ msg: "Cart updated", cartUpdate });
  } else {
    let createCartData: Prisma.CartCreateInput = {
      quantity: parseInt(quantity),
      user: { connect: { id: req.user.id } },
      product: { connect: { id: productId } },
    };

    const cart = await prisma.cart.create({
      data: createCartData,
      include: { user: true, product: true },
    });
    return res.status(200).json({ msg: "Cart created successfully", cart });
  }
  } catch(error){
    console.error(error);
    res.status(500).json({ error });
  }
};

export const deleteCart = async (req: any, res: any) => {
  try{
  const { id } = req.params;
  const cart = await prisma.cart.findUnique({ where: { id } });
  if (!cart) return res.status(400).json({ msg: "cart not found" });

  await prisma.cart.delete({ where: { id } });
  return res.status(200).json({ msg: "cart deleted successfully" });
  } catch (error){
    console.error(error);
    res.status(500).json({ error });
  }
};

const cartDataValidation = (data: any) => {
  const schema = Joi.object({
    quantity: Joi.number().required(),
    productId: Joi.string().required(),
    userId: Joi.string().required(),
  }).options({ allowUnknown: true });
  return schema.validate(data);
};
