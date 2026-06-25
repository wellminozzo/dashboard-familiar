import { useEffect, useState } from "react"
import { Plus, X, Trophy, Calendar, Image } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { api } from "../services/api"
import type { Achievement, CreateAchievementData } from "../types/achievement"
import { formatCurrency, formatDate } from "../utils/format"

const ACHIEVEMENT_TYPE_LABELS: Record<string, string> = {
  VIAGEM: "Viagem",
  EDUCACAO: "Educação",
  PATRIMONIO: "Patrimônio",
  OUTRO: "Outro",
}

const ACHIEVEMENT_TYPE_COLORS: Record<string, string> = {
  VIAGEM: "text-sky-600 bg-sky-50 border-sky-200",
  EDUCACAO: "text-blue-600 bg-blue-50 border-blue-200",
  PATRIMONIO: "text-emerald-600 bg-emerald-50 border-emerald-200",
  OUTRO: "text-purple-600 bg-purple-50 border-purple-200",
}

const ACHIEVEMENT_TYPE_ICONS: Record<string, string> = {
  VIAGEM: "✈️",
  EDUCACAO: "📚",
  PATRIMONIO: "🏠",
  OUTRO: "🎯",
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"VIAGEM" | "EDUCACAO" | "PATRIMONIO" | "OUTRO">("OUTRO")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function loadAchievements() {
    setLoading(true)
    try {
      const res = await api.get<Achievement[]>("/achievements")
      setAchievements(res.data)
    } catch {
      setAchievements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAchievements()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !targetAmount) return

    setSubmitting(true)
    try {
      const data: CreateAchievementData = {
        title,
        description: description || undefined,
        type,
        targetAmount: Number(targetAmount),
        deadline: deadline || undefined,
        imageUrl: imageUrl || undefined,
      }
      await api.post("/achievements", data)
      setModalOpen(false)
      resetForm()
      loadAchievements()
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setType("OUTRO")
    setTargetAmount("")
    setDeadline("")
    setImageUrl("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conquistas</h1>
          <p className="mt-1 text-gray-500">Metas e conquistas da família.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nova Conquista
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : achievements.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma conquista ainda</h3>
          <p className="mt-1 text-sm text-gray-500">Crie sua primeira conquista para começar.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const progress = achievement.targetAmount > 0
              ? Math.min(100, Math.round((achievement.currentAmount / achievement.targetAmount) * 100))
              : 0

            return (
              <div
                key={achievement.id}
                className={`group relative overflow-hidden rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                  achievement.status === "COMPLETED" ? "border-green-200 bg-green-50/30" : ""
                } ${achievement.status === "CANCELLED" ? "opacity-60" : ""}`}
              >
                {achievement.status === "COMPLETED" && (
                  <div className="absolute right-3 top-3 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Concluído
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {achievement.imageUrl ? (
                    <img
                      src={achievement.imageUrl}
                      alt={achievement.title}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`flex h-14 w-14 items-center justify-center rounded-lg border text-2xl ${
                      ACHIEVEMENT_TYPE_COLORS[achievement.type] || "text-gray-500 bg-gray-50 border-gray-200"
                    }`}>
                      {ACHIEVEMENT_TYPE_ICONS[achievement.type] || "🎯"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{achievement.title}</h3>
                    {achievement.description && (
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{achievement.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium text-gray-900">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        achievement.status === "COMPLETED" ? "bg-green-500" : "bg-primary-600"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{formatCurrency(achievement.currentAmount)}</span>
                    <span className="text-gray-500">de {formatCurrency(achievement.targetAmount)}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    ACHIEVEMENT_TYPE_COLORS[achievement.type] || "text-gray-500 bg-gray-50 border-gray-200"
                  }`}>
                    {ACHIEVEMENT_TYPE_LABELS[achievement.type] || achievement.type}
                  </span>
                  {achievement.deadline && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(achievement.deadline)}
                    </span>
                  )}
                </div>
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
              Nova Conquista
            </Dialog.Title>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Viagem para praia"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva sua conquista..."
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.entries(ACHIEVEMENT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor Alvo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="1000,00"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prazo (opcional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">URL da Imagem (opcional)</label>
                <div className="mt-1 flex items-center gap-2">
                  <Image className="h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
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
                  disabled={submitting || !title || !targetAmount}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Criando..." : "Criar Conquista"}
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
