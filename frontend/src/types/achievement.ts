export interface Achievement {
  id: number
  title: string
  description: string | null
  targetAmount: number
  currentAmount: number
  deadline: string | null
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  type: "VIAGEM" | "EDUCACAO" | "PATRIMONIO" | "OUTRO"
  imageUrl: string | null
  linkedCategoryIds: string | null
  userId: number
  createdAt: string
  updatedAt: string
}

export interface CreateAchievementData {
  title: string
  description?: string
  targetAmount: number
  deadline?: string
  type: "VIAGEM" | "EDUCACAO" | "PATRIMONIO" | "OUTRO"
  imageUrl?: string
  linkedCategoryIds?: number[]
}
