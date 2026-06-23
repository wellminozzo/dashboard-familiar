import { z } from "zod"
import { TransactionType } from "@prisma/client"

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.nativeEnum(TransactionType, { errorMap: () => ({ message: "Tipo deve ser INCOME ou EXPENSE" }) }),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.nativeEnum(TransactionType).optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
