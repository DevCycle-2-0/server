import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import { IApprovalWorkflowRepository } from "@modules/features/domain/repositories/IApprovalWorkflowRepository";
import {
  ApprovalWorkflow,
  ApprovalGate,
  WorkflowStatus,
} from "@modules/features/domain/entities/ApprovalWorkflow";
import { ApprovalWorkflowModel } from "../models/ApprovalWorkflowModel";

export class ApprovalWorkflowRepository
  extends BaseRepository<ApprovalWorkflow, ApprovalWorkflowModel>
  implements IApprovalWorkflowRepository
{
  constructor() {
    super(ApprovalWorkflowModel);
  }

  protected toDomain(model: ApprovalWorkflowModel): ApprovalWorkflow {
    const workflow = ApprovalWorkflow.create(
      {
        featureId: model.featureId,
        workspaceId: model.workspaceId,
        gates: model.gates as ApprovalGate[],
      },
      model.id
    );

    // Restore state
    (workflow as any).props.status = model.status as WorkflowStatus;
    (workflow as any).props.currentGateIndex = model.currentGateIndex;
    (workflow as any).props.createdAt = model.createdAt;
    (workflow as any).props.updatedAt = model.updatedAt;

    return workflow;
  }

  protected toModel(domain: ApprovalWorkflow): Partial<ApprovalWorkflowModel> {
    return {
      id: domain.id,
      featureId: domain.featureId,
      status: domain.status,
      currentGateIndex: domain.currentGateIndex,
      gates: domain.gates as any,
      workspaceId: domain.workspaceId,
    };
  }

  async findByFeatureId(featureId: string): Promise<ApprovalWorkflow | null> {
    const model = await this.model.findOne({
      where: { featureId },
    });
    return model ? this.toDomain(model) : null;
  }

  async exists(featureId: string): Promise<boolean> {
    const count = await this.model.count({
      where: { featureId },
    });
    return count > 0;
  }
}
