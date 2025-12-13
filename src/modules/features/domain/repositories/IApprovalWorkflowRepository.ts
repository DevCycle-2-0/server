import { ApprovalWorkflow } from "../entities/ApprovalWorkflow";

export interface IApprovalWorkflowRepository {
  findById(id: string): Promise<ApprovalWorkflow | null>;
  findByFeatureId(featureId: string): Promise<ApprovalWorkflow | null>;
  save(workflow: ApprovalWorkflow): Promise<ApprovalWorkflow>;
  delete(id: string): Promise<boolean>;
  exists(featureId: string): Promise<boolean>;
}
