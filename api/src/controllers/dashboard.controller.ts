import { Request, Response, NextFunction } from "express"
import { DashboardService } from "../services/dashboard.service"

const dashboardService = new DashboardService()

export class DashboardController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { month, year } = req.query
      const data = await dashboardService.getDashboard(
        userId,
        month ? Number(month) : undefined,
        year ? Number(year) : undefined,
      )
      res.json(data)
    } catch (error) {
      next(error)
    }
  }
}
