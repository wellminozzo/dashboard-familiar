import { ArrowDown, ArrowUp, Wallet } from "lucide-react"
import { formatCurrency } from "../../utils/format"
import type { MonthSummary } from "../../types/dashboard"

type SummaryCardsProps = {
  data: MonthSummary
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Receitas</p>
          <div className="rounded-full bg-green-100 p-2">
            <ArrowUp className="h-4 w-4 text-green-600" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(data.income)}</p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Despesas</p>
          <div className="rounded-full bg-red-100 p-2">
            <ArrowDown className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(data.expense)}</p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Saldo</p>
          <div className="rounded-full bg-blue-100 p-2">
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <p className={`mt-2 text-2xl font-bold ${data.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
          {formatCurrency(data.balance)}
        </p>
      </div>
    </div>
  )
}
