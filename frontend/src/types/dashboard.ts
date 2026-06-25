export interface MonthSummary {
  income: number
  expense: number
  balance: number
}

export interface MonthlyHistoryItem {
  month: number
  year: number
  income: number
  expense: number
}

export interface CategoryExpense {
  name: string
  value: number
  color: string
  percentage: number
}

export interface AchievementProgress {
  id: number
  title: string
  description: string | null
  type: string
  status: string
  currentAmount: number
  targetAmount: number
  progress: number
  deadline: string | null
  imageUrl: string | null
}

export interface BudgetProgress {
  id: number
  categoryId: number
  categoryName: string
  categoryColor: string | null
  limitAmount: number
  spentAmount: number
  progress: number
}

export interface DashboardData {
  currentMonth: MonthSummary
  monthlyHistory: MonthlyHistoryItem[]
  expensesByCategory: CategoryExpense[]
  achievements: AchievementProgress[]
  budgets: BudgetProgress[]
}
