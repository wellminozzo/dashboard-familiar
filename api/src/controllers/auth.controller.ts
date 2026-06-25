import { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.service"
import { registerSchema, loginSchema } from "../validators/auth.schema"
import { updateProfileSchema, changePasswordSchema } from "../validators/profile.schema"
import { AppError } from "../middlewares/error.middleware"
import { ZodError } from "zod"

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

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const data = updateProfileSchema.parse(req.body)
      const user = await authService.updateProfile(userId, data)
      res.json(user)
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(error.errors.map(e => e.message).join("; "), 400))
        return
      }
      next(error)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const data = changePasswordSchema.parse(req.body)
      await authService.changePassword(userId, data)
      res.json({ message: "Senha alterada com sucesso" })
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(error.errors.map(e => e.message).join("; "), 400))
        return
      }
      next(error)
    }
  }
}
