import { Router } from "express";
import {
  addToCart,
  deleteCart,
  getAllCart,
  getSingleCart,
} from "../controllers/cart.controller";
import { authentication, authorization } from "../middleware/auth.middle";

const router = Router();

router.get("/", authentication, authorization("admin"), getAllCart);
router.get("/:id", authentication, authorization("admin"), getSingleCart);
router.post("/", authentication, authorization("admin"), addToCart);
router.delete("/:id", authentication, authorization("admin"), deleteCart);

export default router;
