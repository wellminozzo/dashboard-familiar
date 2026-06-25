import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { api } from "../services/api"
import type { Transaction, TransactionListResponse, Category, TransactionFilters, CreateTransactionData, UpdateTransactionData } from "../types/transaction"
import { formatCurrency, formatDate } from "../utils/format"
import { TransactionForm } from "../components/transactions/TransactionForm"

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20 })
  const [showFilters, setShowFilters] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const currentYear = new Date().getFullYear()

  async function loadCategories() {
    try {
      const res = await api.get<Category[]>("/categories")
      setCategories(res.data)
    } catch {
      // silently fail, categories are non-critical for initial render
    }
  }

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.set("type", filters.type)
      if (filters.categoryId) params.set("categoryId", String(filters.categoryId))
      if (filters.month) params.set("month", String(filters.month))
      if (filters.year) params.set("year", String(filters.year))
      if (filters.page) params.set("page", String(filters.page))
      params.set("limit", String(filters.limit ?? 20))

      const res = await api.get<TransactionListResponse>(`/transactions?${params}`)
      setTransactions(res.data.transactions)
      setPagination(res.data.pagination)
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  function applyFilter(update: Partial<TransactionFilters>) {
    setFilters((prev) => ({ ...prev, ...update, page: 1 }))
  }

  function goToPage(page: number) {
    setFilters((prev) => ({ ...prev, page }))
  }

  function openCreateModal() {
    setEditingTransaction(null)
    setModalOpen(true)
  }

  function openEditModal(t: Transaction) {
    setEditingTransaction(t)
    setModalOpen(true)
  }

  async function handleCreate(data: CreateTransactionData | UpdateTransactionData) {
    await api.post("/transactions", data)
    loadTransactions()
  }

  async function handleUpdate(id: number, data: CreateTransactionData | UpdateTransactionData) {
    await api.put(`/transactions/${id}`, data)
    loadTransactions()
  }

  async function handleDelete(id: number) {
    await api.delete(`/transactions/${id}`)
    loadTransactions()
  }

  const [deletingId, setDeletingId] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="mt-1 text-gray-500">Gerencie receitas e despesas.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-white p-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">Tipo</label>
            <select
              value={filters.type ?? ""}
              onChange={(e) => applyFilter({ type: e.target.value as any || undefined })}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Todos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Categoria</label>
            <select
              value={filters.categoryId ?? ""}
              onChange={(e) => applyFilter({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Mês</label>
            <select
              value={filters.month ?? ""}
              onChange={(e) => applyFilter({ month: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Todos</option>
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Ano</label>
            <select
              value={filters.year ?? ""}
              onChange={(e) => applyFilter({ year: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Todos</option>
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Categoria</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {t.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: (t.category.color || "#6b7280") + "20",
                        color: t.category.color || "#6b7280",
                      }}
                    >
                      {t.category.name}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                    t.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}>
                    {t.type === "INCOME" ? "+ " : "- "}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(t.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-gray-300">...</span>
                    )}
                    <button
                      onClick={() => goToPage(p)}
                      className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium ${
                        p === pagination.page
                          ? "bg-primary-100 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionForm
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={async (data) => {
          if (editingTransaction) {
            await handleUpdate(editingTransaction.id, data)
          } else {
            await handleCreate(data)
          }
        }}
        transaction={editingTransaction}
        categories={categories}
        onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
      />

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await handleDelete(deletingId)
                  setDeletingId(null)
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
