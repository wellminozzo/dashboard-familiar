import { z } from "zod"
import { AchievementType } from "@prisma/client"

export const createAchievementSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  targetAmount: z.number().positive("Valor alvo deve ser positivo"),
  deadline: z.string().optional(),
  type: z.nativeEnum(AchievementType, { errorMap: () => ({ message: "Tipo inválido" }) }),
  imageUrl: z.string().optional(),
  linkedCategoryIds: z.array(z.number().int().positive()).optional(),
})

export const updateAchievementSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  targetAmount: z.number().positive().optional(),
  deadline: z.string().optional(),
  type: z.nativeEnum(AchievementType).optional(),
  imageUrl: z.string().optional(),
  linkedCategoryIds: z.array(z.number().int().positive()).optional(),
})

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>
