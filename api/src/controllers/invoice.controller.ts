import { Request, Response, NextFunction } from "express"
import { InvoiceService } from "../services/invoice.service"
import { processInvoiceSchema } from "../validators/invoice.schema"
import { ZodError } from "zod"
import { AppError } from "../middlewares/error.middleware"

const invoiceService = new InvoiceService()

export class InvoiceController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        next(new AppError("Nenhum arquivo enviado", 400))
        return
      }

      const userId = req.user!.userId
      const invoice = await invoiceService.upload(userId, req.file)
      res.status(201).json(invoice)
    } catch (error) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const invoices = await invoiceService.list(userId)
      res.json(invoices)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      const invoice = await invoiceService.getById(id, userId)
      res.json(invoice)
    } catch (error) {
      next(error)
    }
  }

  async process(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      const data = processInvoiceSchema.parse(req.body)
      const transaction = await invoiceService.process(id, userId, data)
      res.status(201).json(transaction)
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(error.errors.map(e => e.message).join("; "), 400))
        return
      }
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = Number(req.params.id)
      await invoiceService.delete(id, userId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
