import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IReleaseRepository } from "@modules/releases/domain/repositories/IReleaseRepository";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { IFeatureRepository } from "@modules/features/domain/repositories/IFeatureRepository";
import { IBugRepository } from "@modules/bugs/domain/repositories/IBugRepository";
import { Release } from "@modules/releases/domain/entities/Release";
import {
  ReleaseDto,
  CreateReleaseRequest,
  UpdateReleaseRequest,
  UpdateReleaseStatusRequest,
  CompletePipelineStageRequest,
  RollbackReleaseRequest,
  UpdateReleaseNotesRequest,
  GetReleasesQuery,
  GenerateNotesResponse,
  PipelineStepDto,
  RollbackLogDto,
} from "../dtos/ReleaseDtos";
import { PipelineStage } from "@modules/releases/domain/entities/Release";

// Helper function to map Release to ReleaseDto
function mapReleaseToDto(release: Release): ReleaseDto {
  return {
    id: release.id,
    version: release.version,
    buildId: release.buildId,
    productId: release.productId,
    productName: release.productName,
    platform: release.platform,
    status: release.status,
    releaseDate: release.releaseDate?.toISOString(),
    plannedDate: release.plannedDate?.toISOString(),
    features: release.features,
    bugFixes: release.bugFixes,
    testCoverage: release.testCoverage,
    pipeline: release.pipeline.map((p) => ({
      stage: p.stage,
      status: p.status,
      startedAt: p.startedAt?.toISOString(),
      completedAt: p.completedAt?.toISOString(),
      logs: p.logs,
    })),
    rollbackLogs: release.rollbackLogs.map((r) => ({
      id: r.id,
      version: r.version,
      reason: r.reason,
      rolledBackAt: r.rolledBackAt.toISOString(),
      rolledBackBy: r.rolledBackBy,
      notes: r.notes,
    })),
    releaseNotes: release.releaseNotes,
    approvalStatus: release.approvalStatus,
    approvers: release.approvers.map((a) => ({
      userId: a.userId,
      userName: a.userName,
      status: a.status,
      comment: a.comment,
      approvedAt: a.approvedAt?.toISOString(),
    })),
    createdAt: release.createdAt.toISOString(),
    updatedAt: release.updatedAt.toISOString(),
  };
}

// Create Release Use Case
interface CreateReleaseInput {
  data: CreateReleaseRequest;
  workspaceId: string;
}

export class CreateReleaseUseCase
  implements UseCase<CreateReleaseInput, Result<ReleaseDto>>
{
  constructor(
    private releaseRepository: IReleaseRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(input: CreateReleaseInput): Promise<Result<ReleaseDto>> {
    const product = await this.productRepository.findById(input.data.productId);
    if (!product) {
      return Result.fail<ReleaseDto>("Product not found");
    }

    if (product.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Product not found");
    }

    const release = Release.create({
      version: input.data.version,
      buildId: input.data.buildId,
      productId: input.data.productId,
      productName: product.name,
      platform: input.data.platform,
      workspaceId: input.workspaceId,
      plannedDate: input.data.plannedDate
        ? new Date(input.data.plannedDate)
        : undefined,
      releaseNotes: input.data.releaseNotes,
    });

    const savedRelease = await this.releaseRepository.save(release);
    return Result.ok<ReleaseDto>(mapReleaseToDto(savedRelease));
  }
}

// Get Releases Use Case
interface GetReleasesInput {
  query: GetReleasesQuery;
  workspaceId: string;
}

interface GetReleasesResult {
  releases: ReleaseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class GetReleasesUseCase
  implements UseCase<GetReleasesInput, Result<GetReleasesResult>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(input: GetReleasesInput): Promise<Result<GetReleasesResult>> {
    const page = input.query.page || 1;
    const limit = Math.min(input.query.limit || 20, 100);

    const { releases, total } = await this.releaseRepository.findAll(
      {
        status: input.query.status,
        productId: input.query.productId,
        platform: input.query.platform,
        workspaceId: input.workspaceId,
      },
      { sortBy: undefined, sortOrder: undefined },
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return Result.ok<GetReleasesResult>({
      releases: releases.map(mapReleaseToDto),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }
}

// Get Release By ID Use Case
export class GetReleaseByIdUseCase
  implements UseCase<string, Result<ReleaseDto>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string): Promise<Result<ReleaseDto>> {
    const release = await this.releaseRepository.findById(releaseId);
    if (!release) {
      return Result.fail<ReleaseDto>("Release not found");
    }
    return Result.ok<ReleaseDto>(mapReleaseToDto(release));
  }
}

// Update Release Use Case
interface UpdateReleaseInput {
  releaseId: string;
  data: UpdateReleaseRequest;
  workspaceId: string;
}

export class UpdateReleaseUseCase
  implements UseCase<UpdateReleaseInput, Result<ReleaseDto>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(input: UpdateReleaseInput): Promise<Result<ReleaseDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    release.update(
      input.data.version,
      input.data.buildId,
      input.data.plannedDate ? new Date(input.data.plannedDate) : undefined,
      input.data.releaseNotes
    );

    const updatedRelease = await this.releaseRepository.save(release);
    return Result.ok<ReleaseDto>(mapReleaseToDto(updatedRelease));
  }
}

// Update Release Status Use Case
interface UpdateReleaseStatusInput {
  releaseId: string;
  data: UpdateReleaseStatusRequest;
  workspaceId: string;
}

export class UpdateReleaseStatusUseCase
  implements UseCase<UpdateReleaseStatusInput, Result<ReleaseDto>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(input: UpdateReleaseStatusInput): Promise<Result<ReleaseDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    release.updateStatus(input.data.status);
    const updatedRelease = await this.releaseRepository.save(release);
    return Result.ok<ReleaseDto>(mapReleaseToDto(updatedRelease));
  }
}

// Start Pipeline Stage Use Case
interface PipelineStageInput {
  releaseId: string;
  stage: PipelineStage;
  workspaceId: string;
}

export class StartPipelineStageUseCase
  implements UseCase<PipelineStageInput, Result<PipelineStepDto>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(input: PipelineStageInput): Promise<Result<PipelineStepDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<PipelineStepDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<PipelineStepDto>("Release not found");
    }

    release.startPipelineStage(input.stage);
    const updatedRelease = await this.releaseRepository.save(release);

    const step = updatedRelease.pipeline.find((s) => s.stage === input.stage);
    if (!step) {
      return Result.fail<PipelineStepDto>("Pipeline stage not found");
    }

    return Result.ok<PipelineStepDto>({
      stage: step.stage,
      status: step.status,
      startedAt: step.startedAt?.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      logs: step.logs,
    });
  }
}

// Complete Pipeline Stage Use Case
interface CompletePipelineStageInput {
  releaseId: string;
  stage: PipelineStage;
  data: CompletePipelineStageRequest;
  workspaceId: string;
}

export class CompletePipelineStageUseCase
  implements UseCase<CompletePipelineStageInput, Result<PipelineStepDto>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(
    input: CompletePipelineStageInput
  ): Promise<Result<PipelineStepDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<PipelineStepDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<PipelineStepDto>("Release not found");
    }

    release.completePipelineStage(
      input.stage,
      input.data.success,
      input.data.notes
    );
    const updatedRelease = await this.releaseRepository.save(release);

    const step = updatedRelease.pipeline.find((s) => s.stage === input.stage);
    if (!step) {
      return Result.fail<PipelineStepDto>("Pipeline stage not found");
    }

    return Result.ok<PipelineStepDto>({
      stage: step.stage,
      status: step.status,
      startedAt: step.startedAt?.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      logs: step.logs,
    });
  }
}

// Rollback Release Use Case
interface RollbackReleaseInput {
  releaseId: string;
  data: RollbackReleaseRequest;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class RollbackReleaseUseCase
  implements UseCase<RollbackReleaseInput, Result<ReleaseDto>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(input: RollbackReleaseInput): Promise<Result<ReleaseDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    release.addRollbackLog(
      input.data.targetVersion,
      input.data.reason,
      input.userName
    );

    const updatedRelease = await this.releaseRepository.save(release);
    return Result.ok<ReleaseDto>(mapReleaseToDto(updatedRelease));
  }
}

// Generate Release Notes Use Case
interface GenerateNotesInput {
  releaseId: string;
  workspaceId: string;
}

export class GenerateReleaseNotesUseCase
  implements UseCase<GenerateNotesInput, Result<GenerateNotesResponse>>
{
  constructor(
    private releaseRepository: IReleaseRepository,
    private featureRepository: IFeatureRepository,
    private bugRepository: IBugRepository
  ) {}

  async execute(
    input: GenerateNotesInput
  ): Promise<Result<GenerateNotesResponse>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<GenerateNotesResponse>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<GenerateNotesResponse>("Release not found");
    }

    let notes = `# Release ${release.version}\n\n`;

    if (release.features.length > 0) {
      notes += "## Features\n";
      for (const feature of release.features) {
        notes += `- ${feature.featureTitle}\n`;
      }
      notes += "\n";
    }

    if (release.bugFixes.length > 0) {
      notes += "## Bug Fixes\n";
      for (const bug of release.bugFixes) {
        notes += `- ${bug.bugTitle}\n`;
      }
      notes += "\n";
    }

    return Result.ok<GenerateNotesResponse>({ notes });
  }
}

// Link Feature Use Case
interface LinkFeatureInput {
  releaseId: string;
  featureId: string;
  workspaceId: string;
}

export class LinkFeatureToReleaseUseCase
  implements UseCase<LinkFeatureInput, Result<ReleaseDto>>
{
  constructor(
    private releaseRepository: IReleaseRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(input: LinkFeatureInput): Promise<Result<ReleaseDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature) {
      return Result.fail<ReleaseDto>("Feature not found");
    }

    if (feature.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Feature not found");
    }

    release.linkFeature(feature.id, feature.title);
    const updatedRelease = await this.releaseRepository.save(release);
    return Result.ok<ReleaseDto>(mapReleaseToDto(updatedRelease));
  }
}

// Unlink Feature Use Case
interface UnlinkFeatureInput {
  releaseId: string;
  featureId: string;
  workspaceId: string;
}

export class UnlinkFeatureFromReleaseUseCase
  implements UseCase<UnlinkFeatureInput, Result<ReleaseDto>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(input: UnlinkFeatureInput): Promise<Result<ReleaseDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    const unlinked = release.unlinkFeature(input.featureId);
    if (!unlinked) {
      return Result.fail<ReleaseDto>("Feature not linked to this release");
    }

    const updatedRelease = await this.releaseRepository.save(release);
    return Result.ok<ReleaseDto>(mapReleaseToDto(updatedRelease));
  }
}

// Link Bug Use Case
interface LinkBugInput {
  releaseId: string;
  bugId: string;
  workspaceId: string;
}

export class LinkBugToReleaseUseCase
  implements UseCase<LinkBugInput, Result<ReleaseDto>>
{
  constructor(
    private releaseRepository: IReleaseRepository,
    private bugRepository: IBugRepository
  ) {}

  async execute(input: LinkBugInput): Promise<Result<ReleaseDto>> {
    const release = await this.releaseRepository.findById(input.releaseId);
    if (!release) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    if (release.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Release not found");
    }

    const bug = await this.bugRepository.findById(input.bugId);
    if (!bug) {
      return Result.fail<ReleaseDto>("Bug not found");
    }

    if (bug.workspaceId !== input.workspaceId) {
      return Result.fail<ReleaseDto>("Bug not found");
    }

    release.linkBugFix(bug.id, bug.title);
    const updatedRelease = await this.releaseRepository.save(release);
    return Result.ok<ReleaseDto>(mapReleaseToDto(updatedRelease));
  }
}
