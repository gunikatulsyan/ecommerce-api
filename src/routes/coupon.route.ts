import { Router } from "express";
import { applyCoupon, createNewCoupon, deleteCoupon, getAllCoupon, getSingleCoupon, updateCoupon } from "../controllers/coupon.controller";
import { authentication, authorization } from "../middleware/auth.middle";

const router = Router();

router.get("/", getAllCoupon)
router.get("/:id", getSingleCoupon)
router.post("/", createNewCoupon)
router.patch("/:id",updateCoupon)
router.delete("/:id", deleteCoupon)
router.post("/apply",authentication, authorization("admin", "buyer", "seller"), applyCoupon)
export default router;