import { Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient";
import Joi from "joi";

export const getAllOrders = async (req: any, res: any) => {
  try {
    const { status, paymentMode, search, page, limit } = req.query;

    const currentPage = parseInt(page as string) || 1;
    const currentLimit = parseInt(limit as string) || 10;

    let filterQuery: Prisma.OrderWhereInput = {};

    if (status) {
      filterQuery.status = status;
    }

    if (paymentMode) {
      filterQuery.paymentMode = paymentMode;
    }

    if (search) {
        filterQuery.shippingAddress = {
        contains: search,
      };
    }

    if (req.query.userId) {
        filterQuery.user = {
        id: req.query.userId as string,
  };
}

    const orders = await prisma.order.findMany({
      where: filterQuery,
      include: { orderItems: true },
      take: currentLimit,
      skip: (currentPage - 1) * currentLimit,
    });

    const totalCount = await prisma.order.count();

    res.status(200).json({
      msg: "Orders fetched successfully",
      orders,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const getSingleOrder = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const orderexist = await prisma.order.findUnique({ where: { id } });
    if (!orderexist) return res.status(400).json({ msg: " Order not found" });

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    res.status(200).json({ msg: "Order fetched successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const createNewOrder = async (req: any, res: any) => {
  try {
    let { paymentMode, shippingAddress, orderItems } = req.body;

    const { error } = OrderDataValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    if (!req.user) {
      return res.status(400).json({ msg: "user not found" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(400).json({ msg: "user not found" });

    let totalPrice = 0;

    let orderItemsData = [];
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res.status(400).json({ msg: `Product not found` });
      }

    if (product.quantity < item.quantity) {
    return res.status(400).json({ msg: `Not enough stock` });
  }

  await prisma.product.update ({where:{id:item.productId}, data:{ quantity:{decrement:item.quantity}}})

      orderItemsData.push({
        price: product.price,
        quantity: item.quantity,
        productId: item.productId,
        productData: product,
      });
      totalPrice += product.price * item.quantity;
    }

    let orderData: Prisma.OrderCreateInput = {
      status: "pending",
      paymentMode,
      shippingAddress,
      totalPrice,
      user: { connect: { id: user.id } },
      orderItems: { createMany: { data: orderItemsData } },
      userData: user,
      totalDiscount: 0,
    };

    const order = await prisma.order.create({
      data: orderData,
      include: { orderItems: { include: { product: true } }, user: true },
    });

    res.status(200).json({ msg: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};



const OrderDataValidation = (data: any) => {
  const schema = Joi.object({
    status: Joi.string().valid(
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ),
    paymentMode: Joi.string().required(),
    shippingAddress: Joi.string().required(),
    orderItems: Joi.array()
      .items(
        Joi.object({
          quantity: Joi.number().required(),
          productId: Joi.string().required(),
        })
      )
      .required(),
  }).options({ allowUnknown: true });

  return schema.validate(data);
};


export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ msg: "Status is required" });

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ msg: "Order not found" });

    const userRole = req.user.role;
    if (userRole !== "admin" && userRole !== "seller") {
      return res.status(403).json({ msg: "Only admin or seller can update status" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({
      msg: `Order status updated '`,
      order: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};