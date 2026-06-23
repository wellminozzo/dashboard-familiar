import { useEffect, useState } from "react"
import { api } from "../services/api"
import { SummaryCards } from "../components/dashboard/SummaryCards"
import { ExpensesPieChart } from "../components/dashboard/ExpensesPieChart"
import { MonthlyBarChart } from "../components/dashboard/MonthlyBarChart"
import { AchievementCards } from "../components/dashboard/AchievementCards"
import type { DashboardData } from "../types/dashboard"

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<DashboardData>("/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Erro ao carregar dados do dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-red-500">{error || "Erro ao carregar dados"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Visão geral das finanças da família.</p>
      </div>

      <SummaryCards data={data.currentMonth} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Despesas por Categoria</h2>
          <ExpensesPieChart data={data.expensesByCategory} />
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Receitas vs Despesas</h2>
          <MonthlyBarChart data={data.monthlyHistory} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Progresso das Conquistas</h2>
        <AchievementCards data={data.achievements} />
      </div>
    </div>
  )
}
