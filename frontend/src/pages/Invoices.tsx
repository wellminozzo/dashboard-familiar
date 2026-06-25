import { useEffect, useState, useRef } from "react"
import { Upload, FileText, Trash2, CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Select from "@radix-ui/react-select"
import { api } from "../services/api"
import type { Invoice, ProcessInvoiceData } from "../types/invoice"
import type { Category } from "../types/transaction"
import { formatCurrency, formatDate } from "../utils/format"

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [processModalOpen, setProcessModalOpen] = useState(false)
  const [processingInvoice, setProcessingInvoice] = useState<Invoice | null>(null)
  const [processCategoryId, setProcessCategoryId] = useState("")
  const [processDescription, setProcessDescription] = useState("")
  const [processType, setProcessType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [submitting, setSubmitting] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [invoicesRes, categoriesRes] = await Promise.all([
        api.get<Invoice[]>("/invoices"),
        api.get<Category[]>("/categories"),
      ])
      setInvoices(invoicesRes.data)
      setCategories(categoriesRes.data)
    } catch {
      setInvoices([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      await api.post("/invoices/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      e.target.value = ""
      loadData()
    } catch {
      // error handled by axios interceptor
    } finally {
      setUploading(false)
    }
  }

  function openProcessModal(invoice: Invoice) {
    setProcessingInvoice(invoice)
    setProcessCategoryId("")
    setProcessDescription(invoice.storeName || "")
    setProcessType("EXPENSE")
    setProcessModalOpen(true)
  }

  async function handleProcess(e: React.FormEvent) {
    e.preventDefault()
    if (!processingInvoice || !processCategoryId) return

    setSubmitting(true)
    try {
      const data: ProcessInvoiceData = {
        categoryId: Number(processCategoryId),
        description: processDescription || undefined,
        type: processType,
      }
      await api.post(`/invoices/${processingInvoice.id}/process`, data)
      setProcessModalOpen(false)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    await api.delete(`/invoices/${id}`)
    loadData()
  }

  function getOcrPreview(ocrData: string | null): string | null {
    if (!ocrData) return null
    try {
      const parsed = JSON.parse(ocrData)
      return parsed.rawText || null
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais</h1>
          <p className="mt-1 text-gray-500">Importe e processe notas fiscais.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Processando OCR..." : "Importar Nota"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma nota fiscal</h3>
          <p className="mt-1 text-sm text-gray-500">Importe uma foto ou PDF de nota fiscal para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const ocrPreview = getOcrPreview(invoice.ocrData)

            return (
              <div
                key={invoice.id}
                className="rounded-lg border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      invoice.processed ? "bg-green-50" : "bg-amber-50"
                    }`}>
                      {invoice.processed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{invoice.fileName}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                        {invoice.storeName && ` — ${invoice.storeName}`}
                        {invoice.totalAmount && ` — ${formatCurrency(Number(invoice.totalAmount))}`}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          invoice.processed
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {invoice.processed ? "Processada" : "Pendente"}
                        </span>
                        {invoice.transactions.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {invoice.transactions.length} transação(ões) vinculada(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!invoice.processed && (
                      <button
                        onClick={() => openProcessModal(invoice)}
                        className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                      >
                        Processar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {!invoice.processed && ocrPreview && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700">
                      <ChevronDown className="mr-1 inline h-3 w-3" />
                      OCR extraído
                    </summary>
                    <pre className="mt-2 max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                      {ocrPreview}
                    </pre>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog.Root open={processModalOpen} onOpenChange={setProcessModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Processar Nota Fiscal
            </Dialog.Title>

            <form onSubmit={handleProcess} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProcessType("EXPENSE")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      processType === "EXPENSE"
                        ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setProcessType("INCOME")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      processType === "INCOME"
                        ? "bg-green-100 text-green-700 ring-2 ring-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <Select.Root value={processCategoryId} onValueChange={setProcessCategoryId}>
                  <Select.Trigger className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <Select.Value placeholder="Selecione uma categoria" />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="z-50 rounded-lg border bg-white p-1 shadow-lg">
                      <Select.Viewport>
                        {categories
                          .filter((c) => c.type === processType)
                          .map((cat) => (
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
                <input
                  type="text"
                  value={processDescription}
                  onChange={(e) => setProcessDescription(e.target.value)}
                  placeholder="Ex: Supermercado"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {processingInvoice?.totalAmount && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm text-gray-600">
                    Valor detectado: <strong>{formatCurrency(Number(processingInvoice.totalAmount))}</strong>
                  </p>
                  {processingInvoice.storeName && (
                    <p className="text-sm text-gray-600">
                      Estabelecimento: <strong>{processingInvoice.storeName}</strong>
                    </p>
                  )}
                </div>
              )}

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
                  disabled={submitting || !processCategoryId}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Processando..." : "Confirmar"}
                </button>
              </div>
            </form>

            <Dialog.Close asChild>
              <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
