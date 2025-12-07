import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { GetWorkspaceAnalyticsUseCase } from "@application/use-cases/analytics/GetWorkspaceAnalyticsUseCase";
import { successResponse } from "@shared/utils/response";

export class AnalyticsController {
  private getWorkspaceAnalyticsUseCase: GetWorkspaceAnalyticsUseCase;

  constructor() {
    this.getWorkspaceAnalyticsUseCase = new GetWorkspaceAnalyticsUseCase();
  }

  getWorkspaceAnalytics = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { workspaceId } = req.params;
      const { period } = req.query;

      const analytics = await this.getWorkspaceAnalyticsUseCase.execute(
        workspaceId,
        period as string
      );

      res.json(successResponse(analytics));
    } catch (error) {
      next(error);
    }
  };
}
