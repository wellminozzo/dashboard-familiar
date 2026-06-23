import { Trophy } from "lucide-react"
import { formatCurrency } from "../../utils/format"
import type { AchievementProgress } from "../../types/dashboard"

type AchievementCardsProps = {
  data: AchievementProgress[]
}

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
}

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
}

export function AchievementCards({ data }: AchievementCardsProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        Nenhuma conquista criada ainda
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {data.slice(0, 4).map((achievement) => (
        <div key={achievement.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium text-gray-900">{achievement.title}</h3>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[achievement.status] || STATUS_COLOR.IN_PROGRESS}`}
            >
              {STATUS_LABEL[achievement.status] || achievement.status}
            </span>
          </div>

          {achievement.description && (
            <p className="mt-1 text-sm text-gray-500">{achievement.description}</p>
          )}

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progresso</span>
              <span className="font-medium text-gray-700">
                {formatCurrency(achievement.currentAmount)} / {formatCurrency(achievement.targetAmount)}
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-500 transition-all"
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
