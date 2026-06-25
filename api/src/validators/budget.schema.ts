import { z } from "zod"

export const createBudgetSchema = z.object({
  month: z.number().int().min(1).max(12, "Mês inválido"),
  year: z.number().int().min(2024, "Ano inválido"),
  limitAmount: z.number().positive("Limite deve ser positivo"),
  categoryId: z.number().int().positive("Categoria inválida"),
})

export const updateBudgetSchema = z.object({
  limitAmount: z.number().positive("Limite deve ser positivo").optional(),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
