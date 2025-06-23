import { Router } from "express";
import { createNewOrder, getAllOrders, getSingleOrder } from "../controllers/order.controller";
import { authentication, authorization } from "../middleware/auth.middle";

const router = Router();
router.get('/', authentication, authorization("buyer"), getAllOrders);
router.get('/',authentication, authorization("buyer"), getSingleOrder);
router.post('/',authentication, authorization("buyer"), createNewOrder)


export default router;
