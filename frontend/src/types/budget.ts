export interface Budget {
  id: number
  month: number
  year: number
  limitAmount: number
  spentAmount: number
  categoryId: number
  category: {
    id: number
    name: string
    icon: string | null
    color: string | null
    type: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetData {
  month: number
  year: number
  limitAmount: number
  categoryId: number
}

export interface UpdateBudgetData {
  limitAmount: number
}
