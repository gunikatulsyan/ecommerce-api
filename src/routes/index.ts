import { Router } from "express";
import userRoutes from './user.routes'
import brandRoutes from './brand.route'
import authRoutes from './auth.route'
const router=Router();

router.use('/user', userRoutes)
router.use('/auth',authRoutes)
router.use('/brand', brandRoutes )

export default router