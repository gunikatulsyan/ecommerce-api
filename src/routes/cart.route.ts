import { Router } from "express";
import {
  addToCart,
  deleteCart,
  getAllCart,
  getSingleCart,
} from "../controllers/cart.controller";
import { authentication, authorization } from "../middleware/auth.middle";

const router = Router();

router.get("/", authentication, authorization("admin", "buyer", "seller"), getAllCart);
router.get("/:id", authentication, authorization("admin", "buyer", "seller"), getSingleCart);
router.post("/", authentication, authorization("admin", "buyer", "seller"), addToCart);
router.delete("/:id", authentication, authorization("admin", "buyer", "seller"), deleteCart);

export default router;
