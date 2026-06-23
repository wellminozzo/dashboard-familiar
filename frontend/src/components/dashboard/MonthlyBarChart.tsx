import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { MonthlyHistoryItem } from "../../types/dashboard"

type MonthlyBarChartProps = {
  data: MonthlyHistoryItem[]
}

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const chartData = data.map((item) => ({
    name: MONTHS[item.month - 1],
    Receitas: item.income,
    Despesas: item.expense,
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumSignificantDigits: 3,
              })
            }
          />
          <Tooltip
            formatter={(value: number) =>
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            }
          />
          <Legend />
          <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
