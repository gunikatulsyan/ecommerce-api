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

router.get("/",authentication, getAllUsers);
router.get("/:id",authentication, getSingleUser);
router.post("/", createNewUser);
router.patch("/",authentication, authorization("admin"), updateUser);
router.delete("/:id",authentication, authorization("admin"), deleteUser);

export default router;