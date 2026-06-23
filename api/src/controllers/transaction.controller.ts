import { Request, Response, NextFunction } from "express"
import { TransactionService } from "../services/transaction.service"
import { createTransactionSchema, updateTransactionSchema } from "../validators/transaction.schema"
import { ZodError } from "zod"
import { AppError } from "../middlewares/error.middleware"

const transactionService = new TransactionService()

export class TransactionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { type, categoryId, month, year, page, limit } = req.query

      const result = await transactionService.list(userId, {
        type: type as any,
        categoryId: categoryId ? Number(categoryId) : undefined,
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      })

      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      const transaction = await transactionService.getById(id, userId)
      res.json(transaction)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const data = createTransactionSchema.parse(req.body)
      const transaction = await transactionService.create(userId, data)
      res.status(201).json(transaction)
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
      const data = updateTransactionSchema.parse(req.body)
      const transaction = await transactionService.update(id, userId, data)
      res.json(transaction)
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
      await transactionService.delete(id, userId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }

  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { month, year } = req.query
      const result = await transactionService.summary(
        userId,
        month ? Number(month) : undefined,
        year ? Number(year) : undefined,
      )
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
