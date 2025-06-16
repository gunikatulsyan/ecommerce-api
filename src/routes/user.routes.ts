import { Router } from "express";
import { createNewUser, deleteUser, getAllUsers, getSingleUser} from "../controllers/user.controller";


const router=Router();

router.get('/', getAllUsers)
router.get('/:id', getSingleUser)
router.post('/',createNewUser)
router.delete('/:id', deleteUser)


export default router