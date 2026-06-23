import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultCategories = [
  { name: "Salário", icon: "briefcase", color: "#22c55e", type: "INCOME" as const },
  { name: "Freelance", icon: "laptop", color: "#3b82f6", type: "INCOME" as const },
  { name: "Investimentos", icon: "trending-up", color: "#8b5cf6", type: "INCOME" as const },
  { name: "Alimentação", icon: "utensils", color: "#ef4444", type: "EXPENSE" as const },
  { name: "Transporte", icon: "car", color: "#f97316", type: "EXPENSE" as const },
  { name: "Moradia", icon: "home", color: "#eab308", type: "EXPENSE" as const },
  { name: "Saúde", icon: "heart", color: "#ec4899", type: "EXPENSE" as const },
  { name: "Educação", icon: "book-open", color: "#06b6d4", type: "EXPENSE" as const },
  { name: "Lazer", icon: "gamepad-2", color: "#a855f7", type: "EXPENSE" as const },
  { name: "Vestuário", icon: "shirt", color: "#14b8a6", type: "EXPENSE" as const },
  { name: "Assinaturas", icon: "repeat", color: "#6b7280", type: "EXPENSE" as const },
  { name: "Outros", icon: "more-horizontal", color: "#78716c", type: "EXPENSE" as const },
]

async function seed() {
  console.log("🌱 Iniciando seed...")

  await prisma.category.deleteMany()
  await prisma.category.createMany({ data: defaultCategories })

  console.log("✅ Seed concluído!")
}

seed()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
