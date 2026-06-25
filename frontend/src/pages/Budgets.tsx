import { useEffect, useState } from "react"
import { Plus, PiggyBank, Pencil, Trash2, ChevronDown, X } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Select from "@radix-ui/react-select"
import { api } from "../services/api"
import type { Budget, CreateBudgetData, UpdateBudgetData } from "../types/budget"
import type { Category } from "../types/transaction"
import { formatCurrency } from "../utils/format"

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function Budgets() {
  const now = new Date()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [categoryId, setCategoryId] = useState("")
  const [limitAmount, setLimitAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        api.get<Budget[]>(`/budgets?month=${selectedMonth}&year=${selectedYear}`),
        api.get<Category[]>("/categories"),
      ])
      setBudgets(budgetsRes.data)
      setCategories(categoriesRes.data)
    } catch {
      setBudgets([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedMonth, selectedYear])

  const EXPENSE_CATEGORIES = categories.filter((c) => c.type === "EXPENSE")
  const usedCategoryIds = new Set(budgets.map((b) => b.categoryId))

  function openCreateModal() {
    setEditingBudget(null)
    setCategoryId("")
    setLimitAmount("")
    setModalOpen(true)
  }

  function openEditModal(budget: Budget) {
    setEditingBudget(budget)
    setCategoryId(String(budget.categoryId))
    setLimitAmount(String(budget.limitAmount))
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId || !limitAmount) return

    setSubmitting(true)
    try {
      if (editingBudget) {
        const data: UpdateBudgetData = { limitAmount: Number(limitAmount) }
        await api.put(`/budgets/${editingBudget.id}`, data)
      } else {
        const data: CreateBudgetData = {
          month: selectedMonth,
          year: selectedYear,
          categoryId: Number(categoryId),
          limitAmount: Number(limitAmount),
        }
        await api.post("/budgets", data)
      }
      setModalOpen(false)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    await api.delete(`/budgets/${id}`)
    loadData()
  }

  const availableCategories = editingBudget
    ? EXPENSE_CATEGORIES
    : EXPENSE_CATEGORIES.filter((c) => !usedCategoryIds.has(c.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="mt-1 text-gray-500">Defina orçamentos mensais por categoria.</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={availableCategories.length === 0}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo Orçamento
        </button>
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Mês</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Ano</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <PiggyBank className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum orçamento definido</h3>
          <p className="mt-1 text-sm text-gray-500">
            Defina orçamentos para {MONTHS[selectedMonth - 1].toLowerCase()} de {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const progress = budget.limitAmount > 0
              ? Math.min(100, Math.round((budget.spentAmount / budget.limitAmount) * 100))
              : 0
            const isOverBudget = budget.spentAmount > budget.limitAmount

            return (
              <div key={budget.id} className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: (budget.category.color || "#6b7280") + "20" }}
                    >
                      {budget.category.icon || "📦"}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{budget.category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(budget.spentAmount)} de {formatCurrency(budget.limitAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${
                      isOverBudget ? "text-red-600" : "text-gray-700"
                    }`}>
                      {progress}%
                    </span>
                    <button
                      onClick={() => openEditModal(budget)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? "bg-red-500" : progress > 80 ? "bg-amber-500" : "bg-primary-600"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                {isOverBudget && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Excedeu o orçamento em {formatCurrency(budget.spentAmount - budget.limitAmount)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {!editingBudget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <Select.Root value={categoryId} onValueChange={setCategoryId}>
                    <Select.Trigger className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <Select.Value placeholder="Selecione uma categoria" />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="z-50 rounded-lg border bg-white p-1 shadow-lg">
                        <Select.Viewport>
                          {availableCategories.map((cat) => (
                            <Select.Item
                              key={cat.id}
                              value={String(cat.id)}
                              className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                            >
                              <Select.ItemText>{cat.name}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Limite {editingBudget ? `(${MONTHS[selectedMonth - 1]} ${selectedYear})` : ""}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="500,00"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={submitting || !limitAmount || (!editingBudget && !categoryId)}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Salvando..." : editingBudget ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>

            <Dialog.Close asChild>
              <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
