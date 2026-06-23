import { Request, Response, NextFunction } from "express"
import { CategoryService } from "../services/category.service"
import { createCategorySchema, updateCategorySchema } from "../validators/category.schema"
import { ZodError } from "zod"
import { AppError } from "../middlewares/error.middleware"

const categoryService = new CategoryService()

export class CategoryController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as any
      const categories = await categoryService.list(type)
      res.json(categories)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const category = await categoryService.getById(id)
      res.json(category)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCategorySchema.parse(req.body)
      const category = await categoryService.create(data)
      res.status(201).json(category)
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
      const id = Number(req.params.id)
      const data = updateCategorySchema.parse(req.body)
      const category = await categoryService.update(id, data)
      res.json(category)
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
      const id = Number(req.params.id)
      await categoryService.delete(id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
