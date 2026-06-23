import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Trophy,
  FileText,
  PiggyBank,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "../../utils/cn"
import { useAuthStore } from "../../store/auth"

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transações" },
  { to: "/achievements", icon: Trophy, label: "Conquistas" },
  { to: "/invoices", icon: FileText, label: "Notas Fiscais" },
  { to: "/budgets", icon: PiggyBank, label: "Orçamentos" },
  { to: "/settings", icon: Settings, label: "Configurações" },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <PiggyBank className="h-6 w-6 text-primary-600" />
        <span className="text-lg font-bold text-gray-900">Finanças Família</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 truncate text-sm font-medium text-gray-900">{user.name}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </aside>
  )
}
