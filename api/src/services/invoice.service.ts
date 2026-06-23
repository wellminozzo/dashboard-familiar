import { prisma } from "../config/prisma"
import { AppError } from "../middlewares/error.middleware"
import type { ProcessInvoiceInput } from "../validators/invoice.schema"
import { createWorker } from "tesseract.js"

function parseBrazilianCurrency(text: string): number | null {
  const patterns = [
    /[Tt]otal[:\s]*R?\$?\s*([\d.]+,\d{2})/,
    /R?\$?\s*([\d.]+,\d{2})/,
    /(\d{1,3}(?:\.\d{3})*,\d{2})/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const cleaned = match[1].replace(/\./g, "").replace(",", ".")
      const value = parseFloat(cleaned)
      if (!isNaN(value) && value > 0) return value
    }
  }

  return null
}

function parseDate(text: string): string | null {
  const patterns = [
    /(\d{2})\/(\d{2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }

  return null
}

function parseStoreName(text: string): string | null {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (line.length > 3 && line.length < 80 && !line.match(/^\d+/) && !line.match(/[Rr]\$|total|cpf|cnpj|data|n\.?f/i)) {
      return line
    }
  }
  return lines[0] || null
}

function parseOcrData(text: string) {
  return {
    rawText: text,
    storeName: parseStoreName(text) || undefined,
    totalAmount: parseBrazilianCurrency(text) || undefined,
    issueDate: parseDate(text) || undefined,
  }
}

export class InvoiceService {
  async upload(userId: number, file: Express.Multer.File) {
    const worker = await createWorker("por")

    try {
      const { data } = await worker.recognize(file.path)
      const parsed = parseOcrData(data.text)

      const invoice = await prisma.invoice.create({
        data: {
          fileName: file.originalname,
          filePath: file.path,
          ocrData: JSON.stringify(parsed),
          totalAmount: parsed.totalAmount,
          storeName: parsed.storeName,
          issueDate: parsed.issueDate ? new Date(parsed.issueDate.split("/").reverse().join("-")) : undefined,
          userId,
        },
      })

      return invoice
    } finally {
      await worker.terminate()
    }
  }

  async list(userId: number) {
    return prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { transactions: true },
    })
  }

  async getById(id: number, userId: number) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: { transactions: true },
    })
    if (!invoice) {
      throw new AppError("Nota fiscal não encontrada", 404)
    }
    return invoice
  }

  async process(id: number, userId: number, data: ProcessInvoiceInput) {
    const invoice = await this.getById(id, userId)

    if (invoice.processed) {
      throw new AppError("Nota fiscal já processada", 400)
    }

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    const amount = invoice.totalAmount
      ? Number(invoice.totalAmount)
      : 0

    if (amount <= 0) {
      throw new AppError("Valor da nota fiscal é inválido ou não foi detectado", 400)
    }

    const description = data.description || invoice.storeName || `Nota fiscal: ${invoice.fileName}`
    const date = data.date
      ? new Date(data.date)
      : invoice.issueDate
        ? new Date(invoice.issueDate)
        : new Date()

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type as any,
        amount,
        description,
        date,
        categoryId: data.categoryId,
        invoiceId: invoice.id,
        userId,
      },
      include: { category: true },
    })

    await prisma.invoice.update({
      where: { id },
      data: { processed: true },
    })

    return transaction
  }

  async delete(id: number, userId: number) {
    await this.getById(id, userId)

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { transactions: true },
    })

    if (invoice && invoice.transactions.length > 0) {
      throw new AppError("Nota fiscal possui transações vinculadas. Exclua as transações primeiro.", 400)
    }

    return prisma.invoice.delete({ where: { id } })
  }
}
