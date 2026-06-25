import { prisma } from "../config/prisma"
import { AppError } from "../middlewares/error.middleware"
import type { CreateBudgetInput, UpdateBudgetInput } from "../validators/budget.schema"

export class BudgetService {
  async list(userId: number, month?: number, year?: number) {
    const now = new Date()
    const m = month ?? now.getMonth() + 1
    const y = year ?? now.getFullYear()

    const budgets = await prisma.budget.findMany({
      where: { userId, month: m, year: y },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    })

    return budgets.map(b => ({
      ...b,
      limitAmount: Number(b.limitAmount),
      spentAmount: Number(b.spentAmount),
    }))
  }

  async getById(id: number, userId: number) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    })

    if (!budget) {
      throw new AppError("Orçamento não encontrado", 404)
    }

    return {
      ...budget,
      limitAmount: Number(budget.limitAmount),
      spentAmount: Number(budget.spentAmount),
    }
  }

  async create(userId: number, data: CreateBudgetInput) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    const existing = await prisma.budget.findFirst({
      where: { userId, month: data.month, year: data.year, categoryId: data.categoryId },
    })

    if (existing) {
      throw new AppError("Já existe um orçamento para esta categoria no período", 409)
    }

    const budget = await prisma.budget.create({
      data: {
        month: data.month,
        year: data.year,
        limitAmount: data.limitAmount,
        categoryId: data.categoryId,
        userId,
      },
      include: { category: true },
    })

    return {
      ...budget,
      limitAmount: Number(budget.limitAmount),
      spentAmount: Number(budget.spentAmount),
    }
  }

  async update(id: number, userId: number, data: UpdateBudgetInput) {
    await this.getById(id, userId)

    const budget = await prisma.budget.update({
      where: { id },
      data: { limitAmount: data.limitAmount },
      include: { category: true },
    })

    return {
      ...budget,
      limitAmount: Number(budget.limitAmount),
      spentAmount: Number(budget.spentAmount),
    }
  }

  async delete(id: number, userId: number) {
    await this.getById(id, userId)
    await prisma.budget.delete({ where: { id } })
  }
}
