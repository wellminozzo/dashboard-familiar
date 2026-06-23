import { prisma } from "../config/prisma"
import { AppError } from "../middlewares/error.middleware"
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.schema"
import type { TransactionType } from "@prisma/client"

export class CategoryService {
  async list(type?: TransactionType) {
    const where = type ? { type } : {}
    return prisma.category.findMany({ where, orderBy: { name: "asc" } })
  }

  async getById(id: number) {
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }
    return category
  }

  async create(data: CreateCategoryInput) {
    return prisma.category.create({ data })
  }

  async update(id: number, data: UpdateCategoryInput) {
    await this.getById(id)
    return prisma.category.update({ where: { id }, data })
  }

  async delete(id: number) {
    await this.getById(id)
    return prisma.category.delete({ where: { id } })
  }
}
