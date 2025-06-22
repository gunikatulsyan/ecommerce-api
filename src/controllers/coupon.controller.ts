import { Discount_type, Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient";
import Joi from "joi";
import moment from 'moment';

export const getAllCoupon = async (req: any, res: any) => {
  try {
    const {
      limit,
      page,
      is_active,
      discount_type,
      max_discount_value,
      min_discount_value,
    } = req.query;
    const currentPage = parseInt(page as string) || 1;
    const currentLimit = parseInt(limit as string) || 10;

    let filterQuery: Prisma.CouponWhereInput = {};

    if (is_active) {
      filterQuery = { ...filterQuery, is_active };
    }

    if (discount_type) {
      filterQuery = { ...filterQuery, discount_type };
    }
    if (max_discount_value) {
      filterQuery = {
        ...filterQuery,
        discount_value: { lte: Number(max_discount_value) },
      };
    }

    if (min_discount_value) {
      filterQuery = {
        ...filterQuery,
        discount_value: { gte: Number(min_discount_value) },
      };
    }

    const coupons = await prisma.coupon.findMany({
      where: filterQuery,
      take: currentLimit,
      skip: (currentPage - 1) * currentLimit,
    });
    const totalCount = await prisma.coupon.count();

    return res.status(200).json({
      msg: "Coupon fetched successfully",
      coupons,
      totalCount,
      pagination: {
        currentPage,
        totalPage: Math.ceil(totalCount / limit),
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
export const getSingleCoupon = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const couponexist = await prisma.coupon.findUnique({ where: { id } });
    if (!couponexist) return res.status(400).json({ msg: "coupon not found" });

    const coupon = await prisma.cart.findUnique({ where: { id } });
    if (!coupon)
      return res
        .status(200)
        .json({ msg: "Coupon fetched successfully", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const createNewCoupon = async (req: any, res: any) => {
  try {
    let { code, is_active, expire_after, discount_type, discount_value, discount_amount } =
      req.body;

    const { error } = CouponDataValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const CouponExist = await prisma.coupon.findFirst({ where: { code } });
    if (CouponExist)
      return res.status(400).json({ msg: "Coupon already exist" });

    const now = moment();
    const expiredDate = now.add(expire_after, 'days' ).format()
    let createCouponData: Prisma.CouponCreateInput = {
      code,
      is_active: Boolean(is_active),
      expire_after: expiredDate,
      discount_type,
      discount_value,
      discount_amount
    };

    const coupon = await prisma.coupon.create({
      data: createCouponData,
    });
    return res.status(200).json({ msg: "Coupon created successfully", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const updateCoupon = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const { is_active, expire_after, discount_type, discount_value } = req.body;

    const couponexist = await prisma.coupon.findUnique({ where: { id } });
    if (!couponexist) return res.status(400).json({ msg: "coupon not found" });

    const { error } = CouponDataValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const ed = moment(expire_after);
    const expiredDate = ed.add(expire_after, 'days' ).format()

    let updateCouponData: Prisma.CouponUpdateInput = {
      is_active,
      expire_after: expiredDate,
      discount_type,
      discount_value,
    };

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateCouponData,
    });
    return res
      .status(200)
      .json({ msg: " Coupon updated successfully", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const deleteCoupon = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return res.status(400).json({ msg: "coupon not found" });

    await prisma.coupon.delete({ where: { id } });
    return res.status(200).json({ msg: "coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const applyCoupon = async (req:any, res:any) =>
{
  try{
    const { code, cart_id} =  req.body;

    const coupon = await prisma.coupon.findFirst({where: { code }});
    if(!coupon) return res.status(404).json({msg: "Invalid Coupon"});
    if(!coupon.is_active) return res.status(400).json({msg: " Coupon is not actie"});
    if(moment().isAfter(moment(coupon.expire_after))){
      return res.status(400).json({msg:"Coupon has expired"});
    }

    const cartItems = await prisma.cart.findUnique({ 
      where: { id: cart_id },
      include: { product: true },
    });
    
    if (!cartItems) {
      return res.status(404).json({ msg: "Cart item not found" });
    }

    const totalPrice = cartItems.quantity * cartItems.product.price;

    let discount = 0;
    if(coupon.discount_type===Discount_type.percentage){
      discount = (coupon.discount_value/100)*totalPrice;
      if (coupon.discount_amount && discount > coupon.discount_amount ){
        discount=coupon.discount_amount
      };
    } else if (coupon.discount_type===Discount_type.amount){
      discount = coupon.discount_value;
    }

    if(discount>totalPrice) discount = totalPrice;
    const finalAmount = totalPrice -discount;

    return res.status(200).json({ msg:" Coupon Applied successfuly", data:{finalAmount, discount, totalPrice}});

  }catch (error){
    console.error(error);
    res.status(500).json({error});
  }
}

const CouponDataValidation = (data: any) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    expire_after:Joi.number().required(),
    is_active: Joi.boolean().required(),
    discount_type: Joi.string().required().valid("percentage", "amount"),
    discount_value: Joi.number().required(),
    discount_amount: Joi.number()
  }).options({ allowUnknown: true });
  return schema.validate(data);
};
