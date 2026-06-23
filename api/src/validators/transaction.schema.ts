import { z } from "zod"
import { TransactionType } from "@prisma/client"

export const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType, { errorMap: () => ({ message: "Tipo deve ser INCOME ou EXPENSE" }) }),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.string().optional(),
  categoryId: z.number().int().positive("Categoria inválida"),
})

export const updateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  amount: z.number().positive("Valor deve ser positivo").optional(),
  description: z.string().min(1, "Descrição é obrigatória").optional(),
  date: z.string().optional(),
  categoryId: z.number().int().positive("Categoria inválida").optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
