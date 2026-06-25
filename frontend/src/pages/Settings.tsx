import { useState, useEffect } from "react"
import { User, Key, Save, Loader2, Tag, Plus, Pencil, Trash2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { api } from "../services/api"
import { useAuthStore } from "../store/auth"
import type { Category } from "../types/transaction"

const CAT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280"]

export function Settings() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [avatar, setAvatar] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [catEditId, setCatEditId] = useState<number | null>(null)
  const [catType, setCatType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [catName, setCatName] = useState("")
  const [catColor, setCatColor] = useState("#6b7280")
  const [catSaving, setCatSaving] = useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileMessage(null)
    setProfileSaving(true)
    try {
      const res = await api.put("/auth/profile", { name, email, avatar: avatar || undefined })
      updateUser(res.data)
      setProfileMessage("Perfil atualizado com sucesso!")
    } catch (err: any) {
      setProfileMessage(err.response?.data?.message || "Erro ao atualizar perfil")
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage("As senhas não conferem")
      return
    }

    setPasswordSaving(true)
    try {
      await api.put("/auth/password", { currentPassword, newPassword })
      setPasswordMessage("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordMessage(err.response?.data?.message || "Erro ao alterar senha")
    } finally {
      setPasswordSaving(false)
    }
  }

  async function loadCategories() {
    setCatLoading(true)
    try {
      const res = await api.get<Category[]>("/categories")
      setCategories(res.data)
    } catch {
      setCategories([])
    } finally {
      setCatLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  function openCreateCategory(type: "INCOME" | "EXPENSE") {
    setCatEditId(null)
    setCatType(type)
    setCatName("")
    setCatColor(CAT_COLORS[0])
    setCatDialogOpen(true)
  }

  function openEditCategory(cat: Category) {
    setCatEditId(cat.id)
    setCatType(cat.type)
    setCatName(cat.name)
    setCatColor(cat.color || CAT_COLORS[0])
    setCatDialogOpen(true)
  }

  async function handleCatSave(e: React.FormEvent) {
    e.preventDefault()
    if (!catName) return

    setCatSaving(true)
    try {
      if (catEditId) {
        await api.put(`/categories/${catEditId}`, { name: catName, color: catColor })
      } else {
        await api.post("/categories", { name: catName, color: catColor, type: catType })
      }
      setCatDialogOpen(false)
      loadCategories()
    } finally {
      setCatSaving(false)
    }
  }

  async function handleCatDelete(id: number) {
    await api.delete(`/categories/${id}`)
    loadCategories()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-gray-500">Gerencie sua conta e preferências.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Perfil</h2>
          </div>

          <form onSubmit={handleProfileSave} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL do Avatar (opcional)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {profileMessage && (
              <p className={`text-sm ${profileMessage.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {profileSaving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Key className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Alterar Senha</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              {passwordSaving ? "Alterando..." : "Alterar Senha"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Categorias</h2>
          </div>
        </div>

        {catLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Despesas</h3>
                <button
                  onClick={() => openCreateCategory("EXPENSE")}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-3 w-3" />
                  Adicionar
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {categories.filter((c) => c.type === "EXPENSE").map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || "#6b7280" }} />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditCategory(cat)} className="rounded p-0.5 text-gray-400 hover:text-gray-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleCatDelete(cat.id)} className="rounded p-0.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {categories.filter((c) => c.type === "EXPENSE").length === 0 && (
                  <p className="col-span-full text-sm text-gray-400">Nenhuma categoria de despesa.</p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Receitas</h3>
                <button
                  onClick={() => openCreateCategory("INCOME")}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-3 w-3" />
                  Adicionar
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {categories.filter((c) => c.type === "INCOME").map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || "#6b7280" }} />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditCategory(cat)} className="rounded p-0.5 text-gray-400 hover:text-gray-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleCatDelete(cat.id)} className="rounded p-0.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {categories.filter((c) => c.type === "INCOME").length === 0 && (
                  <p className="col-span-full text-sm text-gray-400">Nenhuma categoria de receita.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog.Root open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-sm font-semibold text-gray-900">
              {catEditId ? "Editar Categoria" : `Nova Categoria ${catType === "EXPENSE" ? "de Despesa" : "de Receita"}`}
            </Dialog.Title>

            <form onSubmit={handleCatSave} className="mt-4 space-y-4">
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
                  disabled={catSaving || !catName}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {catSaving ? "Salvando..." : catEditId ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
