import express from "express"
import cors from "cors"
import { errorHandler } from "./middlewares/error.middleware"
import { router } from "./routes"

const app = express()

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

app.use("/api", router)

app.use(errorHandler)

export { app }
