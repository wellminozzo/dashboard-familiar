import { Routes, Route } from "react-router-dom"
import { Dashboard } from "./pages/Dashboard"
import { Transactions } from "./pages/Transactions"
import { Achievements } from "./pages/Achievements"
import { Invoices } from "./pages/Invoices"
import { Budgets } from "./pages/Budgets"
import { Settings } from "./pages/Settings"
import { Layout } from "./components/layout/Layout"

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App
