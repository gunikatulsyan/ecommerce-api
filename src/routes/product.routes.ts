import { Router } from "express";
import { createNewProduct, deleteProduct, getAllProducts, getSingleProduct, updateProduct } from "../controllers/product.controller";
import { authentication, authorization } from "../middleware/auth.middle";
import { upload } from "../middleware/multer";
const router = Router();

router.get("/", authentication, getAllProducts);
router.get("/:id", authentication, getSingleProduct);
router.post(
  "/",
  authentication,
  authorization("admin"),
  upload.single("image"),
  createNewProduct

);
router.patch("/:id", authentication, authorization("admin"), updateProduct);
router.delete("/:id", authentication, authorization("admin"), deleteProduct);

export default router;
