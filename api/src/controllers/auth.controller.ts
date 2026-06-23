import { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.service"
import { registerSchema, loginSchema } from "../validators/auth.schema"
import { AppError } from "../middlewares/error.middleware"

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body)
      const result = await authService.register(data)
      res.status(201).json(result)
    } catch (error) {
      if (error instanceof AppError) {
        next(error)
        return
      }
      next(new AppError("Dados inválidos", 400))
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body)
      const result = await authService.login(data)
      res.json(result)
    } catch (error) {
      if (error instanceof AppError) {
        next(error)
        return
      }
      next(new AppError("Dados inválidos", 400))
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const user = await authService.getProfile(userId)
      res.json(user)
    } catch (error) {
      next(error)
    }
  }
}
