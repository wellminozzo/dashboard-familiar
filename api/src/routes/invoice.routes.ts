import { Router } from "express"
import { InvoiceController } from "../controllers/invoice.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { upload } from "../config/multer"

const router = Router()
const controller = new InvoiceController()

router.use(authMiddleware)

router.post("/upload", upload.single("file"), controller.upload.bind(controller))
router.get("/", controller.list.bind(controller))
router.get("/:id", controller.getById.bind(controller))
router.post("/:id/process", controller.process.bind(controller))
router.delete("/:id", controller.delete.bind(controller))

export { router as invoiceRouter }
