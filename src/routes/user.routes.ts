import { Router } from "express";
import {
  createNewUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  updateUser,
} from "../controllers/user.controller";

import { authentication, authorization } from "../middleware/auth.middle";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", authentication, getSingleUser);
router.post("/", createNewUser);
router.patch(
  "/:id",
  authentication,
  authorization("admin", "buyer", "seller"),
  updateUser
);
router.delete(
  "/:id",
  authentication,
  authorization("admin", "buyer", "seller"),
  deleteUser
);

export default router;
