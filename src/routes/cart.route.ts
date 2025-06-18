import { Router } from "express";
import { createNewCart, deleteCart, getAllCart, getSingleCart, updateCart } from "../controllers/cart.controller";
import { authentication, authorization } from "../middleware/auth.middle";


const router = Router();

router.get("/", authentication, getAllCart);
router.get("/:id", authentication, getSingleCart);
router.post(
  "/",
  authentication,
  authorization("admin"),
  createNewCart

);
router.patch("/:id", authentication, authorization("admin"), updateCart);
router.delete("/:id", authentication, authorization("admin"), deleteCart);

export default router;