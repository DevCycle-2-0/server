import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  InitializeWorkflowUseCase,
  GetWorkflowUseCase,
  ApproveGateUseCase,
  RejectGateUseCase,
  RequestChangesUseCase,
  AddCommentUseCase,
  AssignGateUseCase,
} from "@modules/features/application/use-cases/ApprovalWorkflowUseCases";
import { ApprovalWorkflowRepository } from "@modules/features/infrastructure/persistence/repositories/ApprovalWorkflowRepository";
import { FeatureRepository } from "@modules/features/infrastructure/persistence/repositories/FeatureRepository";

export class ApprovalWorkflowController {
  private initializeWorkflowUseCase: InitializeWorkflowUseCase;
  private getWorkflowUseCase: GetWorkflowUseCase;
  private approveGateUseCase: ApproveGateUseCase;
  private rejectGateUseCase: RejectGateUseCase;
  private requestChangesUseCase: RequestChangesUseCase;
  private addCommentUseCase: AddCommentUseCase;
  private assignGateUseCase: AssignGateUseCase;

  constructor() {
    const workflowRepository = new ApprovalWorkflowRepository();
    const featureRepository = new FeatureRepository();

    this.initializeWorkflowUseCase = new InitializeWorkflowUseCase(
      workflowRepository,
      featureRepository
    );
    this.getWorkflowUseCase = new GetWorkflowUseCase(
      workflowRepository,
      featureRepository
    );
    this.approveGateUseCase = new ApproveGateUseCase(
      workflowRepository,
      featureRepository
    );
    this.rejectGateUseCase = new RejectGateUseCase(
      workflowRepository,
      featureRepository
    );
    this.requestChangesUseCase = new RequestChangesUseCase(
      workflowRepository,
      featureRepository
    );
    this.addCommentUseCase = new AddCommentUseCase(
      workflowRepository,
      featureRepository
    );
    this.assignGateUseCase = new AssignGateUseCase(
      workflowRepository,
      featureRepository
    );
  }

  initializeWorkflow = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // Handle empty body - use default gates
      const gates = req.body.gates || undefined;

      const result = await this.initializeWorkflowUseCase.execute({
        data: {
          featureId: req.params.featureId,
          gates: gates,
        },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Initialize workflow error:", error);
      return ApiResponse.internalError(res);
    }
  };
  getWorkflow = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getWorkflowUseCase.execute({
        featureId: req.params.featureId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get workflow error:", error);
      return ApiResponse.internalError(res);
    }
  };

  approveGate = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // TODO: Get from user repository

      const result = await this.approveGateUseCase.execute({
        featureId: req.params.featureId,
        gateId: req.body.gateId,
        userId: req.user.userId,
        userName,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Approve gate error:", error);
      return ApiResponse.internalError(res);
    }
  };

  rejectGate = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // TODO: Get from user repository

      const result = await this.rejectGateUseCase.execute({
        featureId: req.params.featureId,
        gateId: req.body.gateId,
        userId: req.user.userId,
        userName,
        reason: req.body.reason,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Reject gate error:", error);
      return ApiResponse.internalError(res);
    }
  };

  requestChanges = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // TODO: Get from user repository

      const result = await this.requestChangesUseCase.execute({
        featureId: req.params.featureId,
        gateId: req.body.gateId,
        userId: req.user.userId,
        userName,
        comment: req.body.comment,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Request changes error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addComment = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // TODO: Get from user repository

      const result = await this.addCommentUseCase.execute({
        featureId: req.params.featureId,
        gateId: req.body.gateId,
        userId: req.user.userId,
        userName,
        text: req.body.text,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Add comment error:", error);
      return ApiResponse.internalError(res);
    }
  };

  assignGate = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.assignGateUseCase.execute({
        featureId: req.params.featureId,
        gateId: req.body.gateId,
        userId: req.body.userId,
        userName: req.body.userName,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Assign gate error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
