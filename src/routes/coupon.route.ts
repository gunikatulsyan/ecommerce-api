import { Router } from "express";
import { applyCoupon, createNewCoupon, deleteCoupon, getAllCoupon, getSingleCoupon, updateCoupon } from "../controllers/coupon.controller";

const router = Router();

router.get("/", getAllCoupon)
router.get("/:id", getSingleCoupon)
router.post("/", createNewCoupon)
router.patch("/:id",updateCoupon)
router.delete("/:id", deleteCoupon)
router.post("/apply", applyCoupon)
export default router;