import { Routes, Route, Navigate } from "react-router-dom"
import { Dashboard } from "./pages/Dashboard"
import { Transactions } from "./pages/Transactions"
import { Achievements } from "./pages/Achievements"
import { Invoices } from "./pages/Invoices"
import { Budgets } from "./pages/Budgets"
import { Settings } from "./pages/Settings"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Layout } from "./components/layout/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
