import { prisma } from "../config/prisma"
import { AppError } from "../middlewares/error.middleware"
import type { CreateTransactionInput, UpdateTransactionInput } from "../validators/transaction.schema"
import { TransactionType } from "@prisma/client"
import { AchievementService } from "./achievement.service"

const achievementService = new AchievementService()

export class TransactionService {
  async list(userId: number, filters: {
    type?: TransactionType
    categoryId?: number
    month?: number
    year?: number
    page?: number
    limit?: number
  }) {
    const { type, categoryId, month, year, page = 1, limit = 20 } = filters

    const where: any = { userId }

    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId

    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)
      where.date = { gte: startDate, lte: endDate }
    }

    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return {
      transactions: transactions.map(t => ({ ...t, amount: Number(t.amount) })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getById(id: number, userId: number) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    })
    if (!transaction) {
      throw new AppError("Transação não encontrada", 404)
    }
    return { ...transaction, amount: Number(transaction.amount) }
  }

  async create(userId: number, data: CreateTransactionInput) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        categoryId: data.categoryId,
        userId,
      },
      include: { category: true },
    })

    await achievementService.updateProgress(userId, data.categoryId, data.amount)

    return { ...transaction, amount: Number(transaction.amount) }
  }

  async update(id: number, userId: number, data: UpdateTransactionInput) {
    const old = await this.getById(id, userId)

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
      if (!category) {
        throw new AppError("Categoria não encontrada", 404)
      }
    }

    const oldAmount = Number(old.amount)
    const oldCategoryId = old.categoryId
    const newCategoryId = data.categoryId ?? oldCategoryId
    const newAmount = data.amount ?? oldAmount

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: { category: true },
    })

    if (oldCategoryId === newCategoryId) {
      const delta = newAmount - oldAmount
      if (delta !== 0) {
        await achievementService.updateProgress(userId, oldCategoryId, delta)
      }
    } else {
      await achievementService.updateProgress(userId, oldCategoryId, -oldAmount)
      await achievementService.updateProgress(userId, newCategoryId, newAmount)
    }

    return { ...transaction, amount: Number(transaction.amount) }
  }

  async delete(id: number, userId: number) {
    const transaction = await this.getById(id, userId)
    await prisma.transaction.delete({ where: { id } })
    await achievementService.updateProgress(userId, transaction.categoryId, -Number(transaction.amount))
  }

  async summary(userId: number, month?: number, year?: number) {
    const now = new Date()
    const m = month ?? now.getMonth() + 1
    const y = year ?? now.getFullYear()

    const startDate = new Date(y, m - 1, 1)
    const endDate = new Date(y, m, 0, 23, 59, 59, 999)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: "desc" },
    })

    let income = 0
    let expense = 0
    const categoryMap = new Map<string, number>()

    for (const t of transactions) {
      const amount = Number(t.amount)
      if (t.type === TransactionType.INCOME) {
        income += amount
      } else {
        expense += amount
        const catName = t.category.name
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + amount)
      }
    }

    const byCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    return {
      month: m,
      year: y,
      income,
      expense,
      balance: income - expense,
      byCategory,
      transactions: transactions.map(t => ({ ...t, amount: Number(t.amount) })),
    }
  }
}
