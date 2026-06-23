import { prisma } from "../config/prisma"
import { AppError } from "../middlewares/error.middleware"
import { AchievementStatus } from "@prisma/client"
import type { CreateAchievementInput, UpdateAchievementInput } from "../validators/achievement.schema"

export class AchievementService {
  async list(userId: number, status?: AchievementStatus) {
    const where: any = { userId }
    if (status) where.status = status
    return prisma.achievement.findMany({ where, orderBy: { createdAt: "desc" } })
  }

  async getById(id: number, userId: number) {
    const achievement = await prisma.achievement.findFirst({ where: { id, userId } })
    if (!achievement) {
      throw new AppError("Conquista não encontrada", 404)
    }
    return achievement
  }

  async create(userId: number, data: CreateAchievementInput) {
    const linkedCategoryIds = data.linkedCategoryIds
      ? JSON.stringify(data.linkedCategoryIds)
      : undefined

    return prisma.achievement.create({
      data: {
        title: data.title,
        description: data.description,
        targetAmount: data.targetAmount,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        type: data.type,
        imageUrl: data.imageUrl,
        linkedCategoryIds,
        userId,
      },
    })
  }

  async update(id: number, userId: number, data: UpdateAchievementInput) {
    await this.getById(id, userId)

    const linkedCategoryIds = data.linkedCategoryIds
      ? JSON.stringify(data.linkedCategoryIds)
      : undefined

    return prisma.achievement.update({
      where: { id },
      data: {
        ...data,
        linkedCategoryIds,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    })
  }

  async delete(id: number, userId: number) {
    await this.getById(id, userId)
    return prisma.achievement.delete({ where: { id } })
  }

  async updateProgress(userId: number, categoryId: number, amountDelta: number) {
    if (amountDelta === 0) return

    const achievements = await prisma.achievement.findMany({
      where: {
        userId,
        status: AchievementStatus.IN_PROGRESS,
        linkedCategoryIds: { not: null },
      },
    })

    for (const achievement of achievements) {
      const linkedIds = JSON.parse(achievement.linkedCategoryIds!) as number[]
      if (!linkedIds.includes(categoryId)) continue

      const currentAmount = Number(achievement.currentAmount)
      const targetAmount = Number(achievement.targetAmount)
      const newAmount = Math.max(0, currentAmount + amountDelta)
      const newStatus = newAmount >= targetAmount
        ? AchievementStatus.COMPLETED
        : AchievementStatus.IN_PROGRESS

      await prisma.achievement.update({
        where: { id: achievement.id },
        data: {
          currentAmount: newAmount,
          status: newStatus,
        },
      })
    }
  }
}
