import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const router = Router()
const controller = new AuthController()

router.post("/register", controller.register.bind(controller))
router.post("/login", controller.login.bind(controller))
router.get("/me", authMiddleware, controller.me.bind(controller))
router.put("/profile", authMiddleware, controller.updateProfile.bind(controller))
router.put("/password", authMiddleware, controller.changePassword.bind(controller))

export { router as authRouter }
