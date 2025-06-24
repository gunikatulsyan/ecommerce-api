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
  authorization("admin", "buyer", "seller"),
  upload.single("image"),
  createNewProduct

);
router.patch("/:id", authentication, authorization("admin", "buyer", "seller"), updateProduct);
router.delete("/:id", authentication, authorization("admin", "buyer", "seller"), deleteProduct);

export default router;
