import { Router } from "express";
import userRoutes from './user.routes'
import brandRoutes from './brand.route'
import productRoutes from './product.routes'
import authRoutes from './auth.route'
import cartRoutes from './cart.route'
const router=Router();

router.use('/user', userRoutes)
router.use('/auth',authRoutes)
router.use('/brand', brandRoutes )
router.use('/product',productRoutes)
router.use('/cart',cartRoutes)

export default router