import prisma from "../utils/prismaClient";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";

const PRIVATE_KEY = process.env.SECRET_KEY || "ecommerce";

export const login = async (req: any, res: any) => {
  try{
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return res.status(400).json({ msg: "Email doesn't exist" });

  const isMatch = await bcrypt.compare(password, user.account_password);
  if (!isMatch) return res.status(401).json({ error: `Invalid credentials` });

  const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "1hr" });
  return res.status(200).json({ msg: "Login Sucessfull!", token, user });
  }catch (error){
    console.error(error);
    res.status(500).json({ error });
  }
};
