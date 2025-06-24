import { Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { sendMail } from "../utils/mail";

export const getAllUsers = async (req: any, res: any) => {
  try {
    const { limit, page, name, role, status, address, email } = req.query;
    const currentPage = parseInt(page as string) || 1;
    const currentLimit = parseInt(limit as string) || 10;

    let filterQuery: Prisma.UserWhereInput = {};

    if (name) {
      filterQuery = { ...filterQuery, name: { contains: name } };
    }
    if (role) {
      filterQuery = { ...filterQuery, role };
    }
    if (status) {
      filterQuery = { ...filterQuery, status };
    }
    if (address) {
      filterQuery = { ...filterQuery, address: { contains: address } };
    }

    if (email) {
      filterQuery = { ...filterQuery, email: { contains: email } };
    }

    const users = await prisma.user.findMany({
      where: filterQuery,
      take: currentLimit,
      skip: (currentPage - 1) * currentLimit,
    });
    const totalCount = await prisma.user.count();
    return res
      .status(200)
      .json({ msg: "User fetched successfully", users, totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const getSingleUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(400).json({ msg: "User not found" });
    return res.status(200).json({ msg: "User fetched successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const createNewUser = async (req: any, res: any) => {
  try {
    const { name, email, phone, phone_code, address, password, role } =
      req.body;

    const { error } = userDataValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const emailExist = await prisma.user.findFirst({ where: { email } });
    if (emailExist) return res.status(400).json({ msg: "Email already exist" });

    const phoneExist = await prisma.user.findFirst({ where: { phone } });

    if (phoneExist)
      return res.status(400).json({ msg: "Phone number already exist" });

    let createUserData: Prisma.UserCreateInput = {
      name,
      email,
      emailverified: true,
      phone_code,
      phone,
      account_password: await bcrypt.hash(password, 10),
      address,
      numverified: true,
      role,
      status: "approved",
    };

    const user = await prisma.user.create({
      data: createUserData,
    });

    sendMail(user.email, user.name);
    return res.status(200).json({ msg: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const { name, role, status, address } = req.body;
    const { error } = userDataValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });
    let updateUserData: Prisma.UserUpdateInput = {
      name,
      role,
      status,
      address,
    };

    const user = await prisma.user.update({
      data: updateUserData,
      where: { id },
    });
    return res.status(200).json({ msg: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const deleteUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(400).json({ msg: "User not found" });

    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ msg: "User deleted successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

const userDataValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string(),
    address: Joi.string().required(),
    phone_code: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string(),
    role: Joi.string().required().valid("admin", "buyer", "seller"),
    password: Joi.string(),
    emailVerified: Joi.number(),
  }).options({ allowUnknown: true });
  return schema.validate(data);
};
