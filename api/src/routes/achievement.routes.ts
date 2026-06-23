import { Router } from "express"
import { AchievementController } from "../controllers/achievement.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const router = Router()
const controller = new AchievementController()

router.use(authMiddleware)

router.get("/", controller.list.bind(controller))
router.get("/:id", controller.getById.bind(controller))
router.post("/", controller.create.bind(controller))
router.put("/:id", controller.update.bind(controller))
router.delete("/:id", controller.delete.bind(controller))

export { router as achievementRouter }
