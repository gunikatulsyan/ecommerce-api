import { Router } from "express";
import {
  createNewBrand,
  deleteBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
} from "../controllers/brand.controller";
import { authentication, authorization } from "../middleware/auth.middle";
import { upload } from "../middleware/multer";

const router = Router();

router.get("/", getAllBrands);
router.get("/:id", authentication, getSingleBrand);
router.post(
  "/",
  authentication,
  authorization("admin", "buyer", "seller"),
  upload.single("image"),
  createNewBrand
);
router.put(
  "/:id",
  authentication,
  authorization("admin", "buyer", "seller"),
  updateBrand
);
router.delete(
  "/:id",
  authentication,
  authorization("admin", "buyer", "seller"),
  deleteBrand
);

export default router;
