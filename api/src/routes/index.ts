import { Router } from "express"
import { authRouter } from "./auth.routes"

const router = Router()

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

router.use("/auth", authRouter)

export { router }
