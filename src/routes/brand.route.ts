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
  authorization("admin"),
  upload.single("image"),
  createNewBrand
);
router.patch("/:id", authentication, authorization("admin"), updateBrand);
router.delete("/:id", authentication, authorization("admin"), deleteBrand);

export default router;
