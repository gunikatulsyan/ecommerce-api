import jwt from "jsonwebtoken";
import "dotenv/config";

const PRIVATE_KEY = process.env.SECRET_KEY || "ecommerce";

export const authentication = (req: any, res: any, next: any) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: `Token required` });
  try {
    const decode: any = jwt.verify(token, PRIVATE_KEY);
    req.user = decode.user;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

export const authorization =
  (role: any) => async (req: any, res: any, next: any) => {

    if (!role.includes(req.user.role)) {
      res
        .status(400)
        .json({ error: "You do not have permission to access this resources" });
    }
    next();
  };
