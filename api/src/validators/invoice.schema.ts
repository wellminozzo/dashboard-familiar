import { z } from "zod"

export const processInvoiceSchema = z.object({
  categoryId: z.number().int().positive("Categoria é obrigatória"),
  description: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional().default("EXPENSE"),
  date: z.string().optional(),
})

export type ProcessInvoiceInput = z.infer<typeof processInvoiceSchema>
