import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config"
import { AppError } from "./error.middleware"

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
      }
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError("Token não fornecido", 401))
    return
  }

  const token = header.split(" ")[1]

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number }
    req.user = { userId: payload.userId }
    next()
  } catch {
    next(new AppError("Token inválido ou expirado", 401))
  }
}
