import { Router } from "express";
import {
  addToCart,
  deleteCart,
  getAllCart,
  getSingleCart,
} from "../controllers/cart.controller";
import { authentication, authorization } from "../middleware/auth.middle";

const router = Router();

router.get("/", authentication, authorization("buyer"), getAllCart);
router.get("/:id", authentication, authorization("buyer"), getSingleCart);
router.post("/", authentication, authorization("buyer"), addToCart);
router.delete("/:id", authentication, authorization("buyer"), deleteCart);

export default router;
