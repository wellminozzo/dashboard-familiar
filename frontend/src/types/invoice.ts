export interface Invoice {
  id: number
  fileName: string
  filePath: string
  ocrData: string | null
  totalAmount: number | null
  storeName: string | null
  issueDate: string | null
  processed: boolean
  userId: number
  createdAt: string
  updatedAt: string
  transactions: { id: number }[]
}

export interface ProcessInvoiceData {
  categoryId: number
  description?: string
  type?: "INCOME" | "EXPENSE"
  date?: string
}
