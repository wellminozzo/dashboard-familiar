import { prisma } from "../config/prisma"
import { TransactionType, AchievementStatus } from "@prisma/client"

const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#ef4444",
  Transporte: "#f97316",
  Moradia: "#eab308",
  Saúde: "#22c55e",
  Educação: "#3b82f6",
  Lazer: "#8b5cf6",
  Vestuário: "#ec4899",
  Assinaturas: "#06b6d4",
  Outros: "#6b7280",
}

export class DashboardService {
  async getDashboard(userId: number, month?: number, year?: number) {
    const now = new Date()
    const m = month ?? now.getMonth() + 1
    const y = year ?? now.getFullYear()

    const currentMonth = await this.getMonthSummary(userId, m, y)
    const monthlyHistory = await this.getMonthlyHistory(userId, 6)
    const expensesByCategory = await this.getExpensesByCategory(userId, m, y)
    const achievements = await this.getAchievementProgress(userId)
    const budgets = await this.getBudgetProgress(userId, m, y)

    return {
      currentMonth,
      monthlyHistory,
      expensesByCategory,
      achievements,
      budgets,
    }
  }

  private async getBudgetProgress(userId: number, month: number, year: number) {
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    })

    return Promise.all(budgets.map(async (b) => {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)

      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: TransactionType.EXPENSE,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      })

      const spentAmount = Number(spent._sum.amount || 0)
      const limitAmount = Number(b.limitAmount)

      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryColor: b.category.color,
        limitAmount,
        spentAmount,
        progress: limitAmount > 0 ? Math.min(100, Math.round((spentAmount / limitAmount) * 100)) : 0,
      }
    }))
  }

  private async getMonthSummary(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    })

    let income = 0
    let expense = 0

    for (const t of transactions) {
      const amount = Number(t.amount)
      if (t.type === TransactionType.INCOME) {
        income += amount
      } else {
        expense += amount
      }
    }

    return { income, expense, balance: income - expense }
  }

  private async getMonthlyHistory(userId: number, monthsCount: number) {
    const now = new Date()
    const results: Array<{ month: number; year: number; income: number; expense: number }> = []

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
      })

      let income = 0
      let expense = 0

      for (const t of transactions) {
        const amount = Number(t.amount)
        if (t.type === TransactionType.INCOME) {
          income += amount
        } else {
          expense += amount
        }
      }

      results.push({ month, year, income, expense })
    }

    return results
  }

  private async getExpensesByCategory(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    })

    const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const categoryMap = new Map<string, { value: number; color: string }>()

    for (const t of transactions) {
      const name = t.category.name
      const amount = Number(t.amount)
      const existing = categoryMap.get(name) || { value: 0, color: CATEGORY_COLORS[name] || "#6b7280" }
      existing.value += amount
      categoryMap.set(name, existing)
    }

    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color,
      percentage: totalExpense > 0 ? Math.round((data.value / totalExpense) * 100) : 0,
    }))
  }

  private async getAchievementProgress(userId: number) {
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      status: a.status,
      currentAmount: Number(a.currentAmount),
      targetAmount: Number(a.targetAmount),
      progress: Number(a.targetAmount) > 0
        ? Math.min(100, Math.round((Number(a.currentAmount) / Number(a.targetAmount)) * 100))
        : 0,
      deadline: a.deadline,
      imageUrl: a.imageUrl,
    }))
  }
}
