import { Router } from "express"
import { TransactionController } from "../controllers/transaction.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const router = Router()
const controller = new TransactionController()

router.use(authMiddleware)

router.get("/summary", controller.summary.bind(controller))
router.get("/", controller.list.bind(controller))
router.get("/:id", controller.getById.bind(controller))
router.post("/", controller.create.bind(controller))
router.put("/:id", controller.update.bind(controller))
router.delete("/:id", controller.delete.bind(controller))

export { router as transactionRouter }
