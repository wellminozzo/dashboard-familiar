import { Request, Response, NextFunction } from "express"
import { BudgetService } from "../services/budget.service"
import { createBudgetSchema, updateBudgetSchema } from "../validators/budget.schema"
import { ZodError } from "zod"
import { AppError } from "../middlewares/error.middleware"

const budgetService = new BudgetService()

export class BudgetController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { month, year } = req.query
      const budgets = await budgetService.list(userId, month ? Number(month) : undefined, year ? Number(year) : undefined)
      res.json(budgets)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      const budget = await budgetService.getById(id, userId)
      res.json(budget)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const data = createBudgetSchema.parse(req.body)
      const budget = await budgetService.create(userId, data)
      res.status(201).json(budget)
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
      const data = updateBudgetSchema.parse(req.body)
      const budget = await budgetService.update(id, userId, data)
      res.json(budget)
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
      await budgetService.delete(id, userId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
