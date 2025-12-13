import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IApprovalWorkflowRepository } from "@modules/features/domain/repositories/IApprovalWorkflowRepository";
import { IFeatureRepository } from "@modules/features/domain/repositories/IFeatureRepository";
import { ApprovalWorkflow } from "@modules/features/domain/entities/ApprovalWorkflow";
import {
  ApprovalWorkflowDto,
  ApprovalGateDto,
  CreateWorkflowRequest,
} from "../dtos/ApprovalWorkflowDtos";

// Helper to map to DTO
function mapToDto(workflow: ApprovalWorkflow): ApprovalWorkflowDto {
  return {
    id: workflow.id,
    featureId: workflow.featureId,
    status: workflow.status,
    currentGateIndex: workflow.currentGateIndex,
    gates: workflow.gates.map((gate) => ({
      id: gate.id,
      type: gate.type,
      label: gate.label,
      order: gate.order,
      status: gate.status,
      assignedTo: gate.assignedTo,
      assignedToName: gate.assignedToName,
      approvedAt: gate.approvedAt?.toISOString(),
      approvedBy: gate.approvedBy,
      approvedByName: gate.approvedByName,
      rejectedAt: gate.rejectedAt?.toISOString(),
      rejectedBy: gate.rejectedBy,
      rejectedByName: gate.rejectedByName,
      comments: gate.comments.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.userName,
        text: c.text,
        createdAt: c.createdAt.toISOString(),
      })),
    })),
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
  };
}

// Initialize Workflow
interface InitializeWorkflowInput {
  data: CreateWorkflowRequest;
  workspaceId: string;
}

export class InitializeWorkflowUseCase
  implements UseCase<InitializeWorkflowInput, Result<ApprovalWorkflowDto>>
{
  constructor(
    private workflowRepository: IApprovalWorkflowRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(
    input: InitializeWorkflowInput
  ): Promise<Result<ApprovalWorkflowDto>> {
    // Check if feature exists
    const feature = await this.featureRepository.findById(input.data.featureId);
    if (!feature) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    // Validate workspace
    if (feature.workspaceId !== input.workspaceId) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    // Check if workflow already exists
    const existing = await this.workflowRepository.findByFeatureId(
      input.data.featureId
    );
    if (existing) {
      return Result.fail<ApprovalWorkflowDto>(
        "Approval workflow already exists for this feature"
      );
    }

    // Create workflow
    const workflow = ApprovalWorkflow.create({
      featureId: input.data.featureId,
      workspaceId: input.workspaceId,
      gates: input.data.gates?.map((g) => ({
        id: require("uuid").v4(),
        type: g.type,
        label: g.label,
        order: g.order,
        status: "pending" as const,
        assignedTo: g.assignedTo,
        assignedToName: g.assignedToName,
        comments: [],
      })),
    });

    const saved = await this.workflowRepository.save(workflow);
    return Result.ok<ApprovalWorkflowDto>(mapToDto(saved));
  }
}

// Get Workflow
interface GetWorkflowInput {
  featureId: string;
  workspaceId: string;
}

export class GetWorkflowUseCase
  implements UseCase<GetWorkflowInput, Result<ApprovalWorkflowDto>>
{
  constructor(
    private workflowRepository: IApprovalWorkflowRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(input: GetWorkflowInput): Promise<Result<ApprovalWorkflowDto>> {
    // Validate feature exists and workspace
    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature || feature.workspaceId !== input.workspaceId) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    const workflow = await this.workflowRepository.findByFeatureId(
      input.featureId
    );
    if (!workflow) {
      return Result.fail<ApprovalWorkflowDto>("Approval workflow not found");
    }

    return Result.ok<ApprovalWorkflowDto>(mapToDto(workflow));
  }
}

// Approve Gate
interface ApproveGateInput {
  featureId: string;
  gateId: string;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class ApproveGateUseCase
  implements UseCase<ApproveGateInput, Result<ApprovalWorkflowDto>>
{
  constructor(
    private workflowRepository: IApprovalWorkflowRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(input: ApproveGateInput): Promise<Result<ApprovalWorkflowDto>> {
    const workflow = await this.workflowRepository.findByFeatureId(
      input.featureId
    );
    if (!workflow) {
      return Result.fail<ApprovalWorkflowDto>("Approval workflow not found");
    }

    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature || feature.workspaceId !== input.workspaceId) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    const success = workflow.approveGate(
      input.gateId,
      input.userId,
      input.userName
    );
    if (!success) {
      return Result.fail<ApprovalWorkflowDto>("Failed to approve gate");
    }

    const updated = await this.workflowRepository.save(workflow);
    return Result.ok<ApprovalWorkflowDto>(mapToDto(updated));
  }
}

// Reject Gate
interface RejectGateInput {
  featureId: string;
  gateId: string;
  userId: string;
  userName: string;
  reason: string;
  workspaceId: string;
}

export class RejectGateUseCase
  implements UseCase<RejectGateInput, Result<ApprovalWorkflowDto>>
{
  constructor(
    private workflowRepository: IApprovalWorkflowRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(input: RejectGateInput): Promise<Result<ApprovalWorkflowDto>> {
    const workflow = await this.workflowRepository.findByFeatureId(
      input.featureId
    );
    if (!workflow) {
      return Result.fail<ApprovalWorkflowDto>("Approval workflow not found");
    }

    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature || feature.workspaceId !== input.workspaceId) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    const success = workflow.rejectGate(
      input.gateId,
      input.userId,
      input.userName,
      input.reason
    );
    if (!success) {
      return Result.fail<ApprovalWorkflowDto>("Failed to reject gate");
    }

    const updated = await this.workflowRepository.save(workflow);
    return Result.ok<ApprovalWorkflowDto>(mapToDto(updated));
  }
}

// Request Changes
interface RequestChangesInput {
  featureId: string;
  gateId: string;
  userId: string;
  userName: string;
  comment: string;
  workspaceId: string;
}

export class RequestChangesUseCase
  implements UseCase<RequestChangesInput, Result<ApprovalWorkflowDto>>
{
  constructor(
    private workflowRepository: IApprovalWorkflowRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(
    input: RequestChangesInput
  ): Promise<Result<ApprovalWorkflowDto>> {
    const workflow = await this.workflowRepository.findByFeatureId(
      input.featureId
    );
    if (!workflow) {
      return Result.fail<ApprovalWorkflowDto>("Approval workflow not found");
    }

    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature || feature.workspaceId !== input.workspaceId) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    const success = workflow.requestChanges(
      input.gateId,
      input.userId,
      input.userName,
      input.comment
    );
    if (!success) {
      return Result.fail<ApprovalWorkflowDto>("Failed to request changes");
    }

    const updated = await this.workflowRepository.save(workflow);
    return Result.ok<ApprovalWorkflowDto>(mapToDto(updated));
  }
}

// Add Comment
interface AddCommentInput {
  featureId: string;
  gateId: string;
  userId: string;
  userName: string;
  text: string;
  workspaceId: string;
}

export class AddCommentUseCase
  implements UseCase<AddCommentInput, Result<ApprovalWorkflowDto>>
{
  constructor(
    private workflowRepository: IApprovalWorkflowRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(input: AddCommentInput): Promise<Result<ApprovalWorkflowDto>> {
    const workflow = await this.workflowRepository.findByFeatureId(
      input.featureId
    );
    if (!workflow) {
      return Result.fail<ApprovalWorkflowDto>("Approval workflow not found");
    }

    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature || feature.workspaceId !== input.workspaceId) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    const success = workflow.addComment(
      input.gateId,
      input.userId,
      input.userName,
      input.text
    );
    if (!success) {
      return Result.fail<ApprovalWorkflowDto>("Failed to add comment");
    }

    const updated = await this.workflowRepository.save(workflow);
    return Result.ok<ApprovalWorkflowDto>(mapToDto(updated));
  }
}

// Assign Gate
interface AssignGateInput {
  featureId: string;
  gateId: string;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class AssignGateUseCase
  implements UseCase<AssignGateInput, Result<ApprovalWorkflowDto>>
{
  constructor(
    private workflowRepository: IApprovalWorkflowRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(input: AssignGateInput): Promise<Result<ApprovalWorkflowDto>> {
    const workflow = await this.workflowRepository.findByFeatureId(
      input.featureId
    );
    if (!workflow) {
      return Result.fail<ApprovalWorkflowDto>("Approval workflow not found");
    }

    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature || feature.workspaceId !== input.workspaceId) {
      return Result.fail<ApprovalWorkflowDto>("Feature not found");
    }

    const success = workflow.assignGate(
      input.gateId,
      input.userId,
      input.userName
    );
    if (!success) {
      return Result.fail<ApprovalWorkflowDto>("Failed to assign gate");
    }

    const updated = await this.workflowRepository.save(workflow);
    return Result.ok<ApprovalWorkflowDto>(mapToDto(updated));
  }
}
