import { Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { error } from "console";
import path from "path";

export const getAllBrands = async (req: any, res: any) => {
  const { limit, page, name, is_active } = req.query;
  const currentPage = parseInt(page as string) || 1;
  const currentLimit = parseInt(limit as string) || 10;

  let filterQuery: Prisma.BrandWhereInput = {};

  if (name) {
    filterQuery = { ...filterQuery, name: { contains: name } };
  }

  if (is_active) {
    filterQuery = { ...filterQuery, is_active };
  }

  const brands = await prisma.brand.findMany({
    where: filterQuery,
    take: currentLimit,
    skip: (currentPage - 1) * currentLimit,
  });
  const totalCount = await prisma.brand.count();
  return res
    .status(200)
    .json({ msg: " Brand fetched successfully", brands, totalCount });
};

export const getSingleBrand = async (req: any, res: any) => {
  const { id } = req.params;
  const brand = await prisma.user.findUnique({ where: { id } });
  if (!brand) return res.status(400).json({ msg: "Brand not found" });
  return res.status(200).json({ msg: "Brand fetched successfully", brand });
};

export const createNewBrand = async (req: any, res: any) => {
  let { name, is_active, description } = req.body;
  const image = req.file.filename;

  is_active = is_active === "true";

  const { error } = brandDataValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  const nameExist = await prisma.brand.findFirst({ where: { name } });
  if (nameExist) return res.status(400).json({ msg: "Brand already exist" });

  let createBrandData: Prisma.BrandCreateInput = {
    name,
    is_active: Boolean(is_active),
    description,
    image
  };

  const brand = await prisma.brand.create({
    data: createBrandData,
  });
  return res.status(200).json({ msg: "Brand created successfully", brand });
};

export const updateBrand = async (req: any, res: any) => {
  const { id } = req.params;
  

  const { is_active } = req.body;

  const brandexist = await prisma.brand.findUnique({ where: { id } });
  if (!brandexist) return res.status(400).json({ msg: "Brand not found" });

  const { error } = brandDataValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  let updateBrandData: Prisma.BrandUpdateInput = {
    is_active,
  };

  const brand = await prisma.brand.update({
      where: {id},
    data: updateBrandData,
  });
  return res.status(200).json({ msg: " Brand updated successfully", brand });
};

export const deleteBrand = async (req: any, res: any) => {
  const { id } = req.params;
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return res.status(400).json({ msg: "Brand not found" });
  await prisma.brand.delete({ where: { id } });
  return res.status(200).json({ msg: "Brand deleted successfully", brand });
};
const brandDataValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    is_active: Joi.boolean().required(),
    description: Joi.string(),
  }).options({ allowUnknown: true });
  return schema.validate(data);
};
