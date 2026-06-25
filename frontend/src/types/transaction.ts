export interface Category {
  id: number
  name: string
  icon: string | null
  color: string | null
  type: "INCOME" | "EXPENSE"
}

export interface Transaction {
  id: number
  type: "INCOME" | "EXPENSE"
  amount: number
  description: string
  date: string
  categoryId: number
  category: Category
  userId: number
  createdAt: string
  updatedAt: string
}

export interface TransactionFilters {
  type?: "INCOME" | "EXPENSE"
  categoryId?: number
  month?: number
  year?: number
  page?: number
  limit?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TransactionListResponse {
  transactions: Transaction[]
  pagination: PaginationInfo
}

export interface CreateTransactionData {
  type: "INCOME" | "EXPENSE"
  amount: number
  description: string
  date?: string
  categoryId: number
}

export interface UpdateTransactionData {
  type?: "INCOME" | "EXPENSE"
  amount?: number
  description?: string
  date?: string
  categoryId?: number
}

export interface TransactionSummary {
  month: number
  year: number
  income: number
  expense: number
  balance: number
  byCategory: { name: string; value: number }[]
  transactions: Transaction[]
}
