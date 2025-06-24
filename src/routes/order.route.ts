import { Router } from "express";
import {
  createNewOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authentication, authorization } from "../middleware/auth.middle";

const router = Router();
router.get(
  "/",
  authentication,
  authorization("buyer", "admin", "seller"),
  getAllOrders
);
router.get(
  "/",
  authentication,
  authorization("buyer", "admin", "seller"),
  getSingleOrder
);
router.post(
  "/",
  authentication,
  authorization("buyer", "admin", "seller"),
  createNewOrder
);
router.patch("/:id", authentication, authorization("buyer", "admin", "seller"), updateOrderStatus )
export default router;
