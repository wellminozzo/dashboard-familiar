import { Request, Response, NextFunction } from "express"
import { AchievementService } from "../services/achievement.service"
import { createAchievementSchema, updateAchievementSchema } from "../validators/achievement.schema"
import { ZodError } from "zod"
import { AppError } from "../middlewares/error.middleware"

const achievementService = new AchievementService()

export class AchievementController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const status = req.query.status as any
      const achievements = await achievementService.list(userId, status)
      res.json(achievements)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      const achievement = await achievementService.getById(id, userId)
      res.json(achievement)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const data = createAchievementSchema.parse(req.body)
      const achievement = await achievementService.create(userId, data)
      res.status(201).json(achievement)
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(error.errors.map(e => e.message).join("; "), 400))
        return
      }
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      const data = updateAchievementSchema.parse(req.body)
      const achievement = await achievementService.update(id, userId, data)
      res.json(achievement)
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(error.errors.map(e => e.message).join("; "), 400))
        return
      }
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      await achievementService.delete(id, userId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
