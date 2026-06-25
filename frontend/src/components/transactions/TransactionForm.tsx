import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Select from "@radix-ui/react-select"
import { ChevronDown, X } from "lucide-react"
import { api } from "../../services/api"
import type { Category, Transaction, CreateTransactionData, UpdateTransactionData } from "../../types/transaction"

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTransactionData | UpdateTransactionData) => Promise<void>
  transaction?: Transaction | null
  categories: Category[]
  onCategoryCreated: (category: Category) => void
}

export function TransactionForm({ open, onOpenChange, onSubmit, transaction, categories, onCategoryCreated }: TransactionFormProps) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction?.type ?? "EXPENSE")
  const [categoryId, setCategoryId] = useState<string>(transaction?.categoryId.toString() ?? "")
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "")
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [date, setDate] = useState(transaction ? transaction.date.split("T")[0] : new Date().toISOString().split("T")[0])
  const [submitting, setSubmitting] = useState(false)

  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [catName, setCatName] = useState("")
  const [catColor, setCatColor] = useState("#6b7280")
  const [catCreating, setCatCreating] = useState(false)

  const filteredCategories = categories.filter((c) => c.type === type)

  const CAT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280"]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId || !amount || !description) return

    setSubmitting(true)
    try {
      const data = {
        type,
        categoryId: Number(categoryId),
        amount: Number(amount),
        description,
        date: new Date(date).toISOString(),
      }

      if (transaction) {
        await onSubmit(data as UpdateTransactionData)
      } else {
        await onSubmit(data as CreateTransactionData)
      }
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catName) return

    setCatCreating(true)
    try {
      const res = await api.post<Category>("/categories", { name: catName, color: catColor, type })
      onCategoryCreated(res.data)
      setCategoryId(String(res.data.id))
      setCatDialogOpen(false)
      setCatName("")
    } finally {
      setCatCreating(false)
    }
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {transaction ? "Editar Transação" : "Nova Transação"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setType("EXPENSE"); setCategoryId("") }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      type === "EXPENSE"
                        ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType("INCOME"); setCategoryId("") }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      type === "INCOME"
                        ? "bg-green-100 text-green-700 ring-2 ring-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <button
                    type="button"
                    onClick={() => { setCatName(""); setCatColor("#6b7280"); setCatDialogOpen(true) }}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    + Criar nova
                  </button>
                </div>
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
                        {filteredCategories.map((cat) => (
                          <Select.Item
                            key={cat.id}
                            value={String(cat.id)}
                            className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Select.ItemText>
                              <span className="flex items-center gap-2">
                                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color || "#6b7280" }} />
                                {cat.name}
                              </span>
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                        {filteredCategories.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-400">
                            Nenhuma categoria {type === "EXPENSE" ? "de despesa" : "de receita"}
                          </div>
                        )}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Supermercado"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  disabled={submitting || !categoryId || !amount || !description}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
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

      <Dialog.Root open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-sm font-semibold text-gray-900">
              Nova Categoria {type === "EXPENSE" ? "de Despesa" : "de Receita"}
            </Dialog.Title>

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Mercado"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cor</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {CAT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCatColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        catColor === color ? "border-gray-900 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCatDialogOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={catCreating || !catName}
                  className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {catCreating ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
