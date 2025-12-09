import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  CreateReleaseUseCase,
  GetReleasesUseCase,
  GetReleaseByIdUseCase,
  UpdateReleaseUseCase,
  UpdateReleaseStatusUseCase,
  StartPipelineStageUseCase,
  CompletePipelineStageUseCase,
  RollbackReleaseUseCase,
  GenerateReleaseNotesUseCase,
  LinkFeatureToReleaseUseCase,
  UnlinkFeatureFromReleaseUseCase,
  LinkBugToReleaseUseCase,
} from "@modules/releases/application/use-cases/ReleaseUseCases";
import { ReleaseRepository } from "@modules/releases/infrastructure/persistence/repositories/ReleaseRepository";
import { ProductRepository } from "@modules/products/infrastructure/persistence/repositories/ProductRepository";
import { FeatureRepository } from "@modules/features/infrastructure/persistence/repositories/FeatureRepository";
import { BugRepository } from "@modules/bugs/infrastructure/persistence/repositories/BugRepository";
import { PipelineStage } from "@modules/releases/domain/entities/Release";

export class ReleaseController {
  private createReleaseUseCase: CreateReleaseUseCase;
  private getReleasesUseCase: GetReleasesUseCase;
  private getReleaseByIdUseCase: GetReleaseByIdUseCase;
  private updateReleaseUseCase: UpdateReleaseUseCase;
  private updateReleaseStatusUseCase: UpdateReleaseStatusUseCase;
  private startPipelineStageUseCase: StartPipelineStageUseCase;
  private completePipelineStageUseCase: CompletePipelineStageUseCase;
  private rollbackReleaseUseCase: RollbackReleaseUseCase;
  private generateReleaseNotesUseCase: GenerateReleaseNotesUseCase;
  private linkFeatureToReleaseUseCase: LinkFeatureToReleaseUseCase;
  private unlinkFeatureFromReleaseUseCase: UnlinkFeatureFromReleaseUseCase;
  private linkBugToReleaseUseCase: LinkBugToReleaseUseCase;

  constructor() {
    const releaseRepository = new ReleaseRepository();
    const productRepository = new ProductRepository();
    const featureRepository = new FeatureRepository();
    const bugRepository = new BugRepository();

    this.createReleaseUseCase = new CreateReleaseUseCase(
      releaseRepository,
      productRepository
    );
    this.getReleasesUseCase = new GetReleasesUseCase(releaseRepository);
    this.getReleaseByIdUseCase = new GetReleaseByIdUseCase(releaseRepository);
    this.updateReleaseUseCase = new UpdateReleaseUseCase(releaseRepository);
    this.updateReleaseStatusUseCase = new UpdateReleaseStatusUseCase(
      releaseRepository
    );
    this.startPipelineStageUseCase = new StartPipelineStageUseCase(
      releaseRepository
    );
    this.completePipelineStageUseCase = new CompletePipelineStageUseCase(
      releaseRepository
    );
    this.rollbackReleaseUseCase = new RollbackReleaseUseCase(releaseRepository);
    this.generateReleaseNotesUseCase = new GenerateReleaseNotesUseCase(
      releaseRepository,
      featureRepository,
      bugRepository
    );
    this.linkFeatureToReleaseUseCase = new LinkFeatureToReleaseUseCase(
      releaseRepository,
      featureRepository
    );
    this.unlinkFeatureFromReleaseUseCase = new UnlinkFeatureFromReleaseUseCase(
      releaseRepository
    );
    this.linkBugToReleaseUseCase = new LinkBugToReleaseUseCase(
      releaseRepository,
      bugRepository
    );
  }

  getReleases = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getReleasesUseCase.execute({
        query: {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
          status: req.query.status as string | undefined,
          productId: req.query.productId as string | undefined,
          platform: req.query.platform as string | undefined,
        },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      const { releases, pagination } = result.getValue();
      return ApiResponse.paginated(
        res,
        releases,
        pagination.page,
        pagination.limit,
        pagination.total
      );
    } catch (error) {
      console.error("Get releases error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getReleaseById = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getReleaseByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get release by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  createRelease = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.createReleaseUseCase.execute({
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Create release error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateRelease = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateReleaseUseCase.execute({
        releaseId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update release error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteRelease = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement delete release use case
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete release error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateReleaseStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateReleaseStatusUseCase.execute({
        releaseId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update release status error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getPipeline = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getReleaseByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      const release = result.getValue();
      return ApiResponse.success(res, release.pipeline);
    } catch (error) {
      console.error("Get pipeline error:", error);
      return ApiResponse.internalError(res);
    }
  };

  startPipelineStage = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.startPipelineStageUseCase.execute({
        releaseId: req.params.id,
        stage: req.params.stage as PipelineStage,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Start pipeline stage error:", error);
      return ApiResponse.internalError(res);
    }
  };

  completePipelineStage = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.completePipelineStageUseCase.execute({
        releaseId: req.params.id,
        stage: req.params.stage as PipelineStage,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Complete pipeline stage error:", error);
      return ApiResponse.internalError(res);
    }
  };

  retryPipelineStage = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement retry pipeline stage use case
      return ApiResponse.success(res, { message: "Pipeline stage retried" });
    } catch (error) {
      console.error("Retry pipeline stage error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deployRelease = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement deploy release logic
      return ApiResponse.success(res, { message: "Release deployed" });
    } catch (error) {
      console.error("Deploy release error:", error);
      return ApiResponse.internalError(res);
    }
  };

  rollbackRelease = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // Placeholder

      const result = await this.rollbackReleaseUseCase.execute({
        releaseId: req.params.id,
        data: req.body,
        userId: req.user.userId,
        userName: userName,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Rollback release error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getRollbacks = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getReleaseByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      const release = result.getValue();
      return ApiResponse.success(res, release.rollbackLogs);
    } catch (error) {
      console.error("Get rollbacks error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateReleaseNotes = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateReleaseUseCase.execute({
        releaseId: req.params.id,
        data: { releaseNotes: req.body.notes },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update release notes error:", error);
      return ApiResponse.internalError(res);
    }
  };

  generateReleaseNotes = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.generateReleaseNotesUseCase.execute({
        releaseId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, { data: result.getValue() });
    } catch (error) {
      console.error("Generate release notes error:", error);
      return ApiResponse.internalError(res);
    }
  };

  exportReleaseNotes = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement actual export logic
      const format = req.query.format as string;
      const downloadUrl = `https://storage.example.com/release-notes.${format}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      return ApiResponse.success(res, {
        data: {
          downloadUrl,
          expiresAt: expiresAt.toISOString(),
        },
      });
    } catch (error) {
      console.error("Export release notes error:", error);
      return ApiResponse.internalError(res);
    }
  };

  linkFeature = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.linkFeatureToReleaseUseCase.execute({
        releaseId: req.params.id,
        featureId: req.body.featureId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Link feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  unlinkFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.unlinkFeatureFromReleaseUseCase.execute({
        releaseId: req.params.id,
        featureId: req.params.featureId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Unlink feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  linkBug = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.linkBugToReleaseUseCase.execute({
        releaseId: req.params.id,
        bugId: req.body.bugId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Link bug error:", error);
      return ApiResponse.internalError(res);
    }
  };

  unlinkBug = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement unlink bug use case
      return ApiResponse.success(res, { message: "Bug unlinked" });
    } catch (error) {
      console.error("Unlink bug error:", error);
      return ApiResponse.internalError(res);
    }
  };

  requestApproval = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement request approval use case
      return ApiResponse.success(res, { message: "Approval requested" });
    } catch (error) {
      console.error("Request approval error:", error);
      return ApiResponse.internalError(res);
    }
  };

  approveRelease = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement approve release use case
      return ApiResponse.success(res, { message: "Release approved" });
    } catch (error) {
      console.error("Approve release error:", error);
      return ApiResponse.internalError(res);
    }
  };

  rejectRelease = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement reject release use case
      return ApiResponse.success(res, { message: "Release rejected" });
    } catch (error) {
      console.error("Reject release error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getApprovalStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getReleaseByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      const release = result.getValue();
      return ApiResponse.success(res, {
        data: {
          status: release.approvalStatus || "pending",
          approvers: release.approvers,
        },
      });
    } catch (error) {
      console.error("Get approval status error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
