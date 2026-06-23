import { Router } from "express"
import { authRouter } from "./auth.routes"
import { categoryRouter } from "./category.routes"
import { transactionRouter } from "./transaction.routes"
import { achievementRouter } from "./achievement.routes"
import { invoiceRouter } from "./invoice.routes"
import { dashboardRouter } from "./dashboard.routes"

const router = Router()

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

router.use("/auth", authRouter)
router.use("/categories", categoryRouter)
router.use("/transactions", transactionRouter)
router.use("/achievements", achievementRouter)
router.use("/invoices", invoiceRouter)
router.use("/dashboard", dashboardRouter)

export { router }
