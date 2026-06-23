import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { CategoryExpense } from "../../types/dashboard"

type ExpensesPieChartProps = {
  data: CategoryExpense[]
}

export function ExpensesPieChart({ data }: ExpensesPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Nenhuma despesa no mês atual
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
