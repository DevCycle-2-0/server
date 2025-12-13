import {
  GateType,
  GateStatus,
  WorkflowStatus,
} from "@modules/features/domain/entities/ApprovalWorkflow";

export interface CommentDto {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ApprovalGateDto {
  id: string;
  type: GateType;
  label: string;
  order: number;
  status: GateStatus;
  assignedTo?: string;
  assignedToName?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  comments: CommentDto[];
}

export interface ApprovalWorkflowDto {
  id: string;
  featureId: string;
  status: WorkflowStatus;
  currentGateIndex: number;
  gates: ApprovalGateDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowRequest {
  featureId: string;
  gates?: Array<{
    type: GateType;
    label: string;
    order: number;
    assignedTo?: string;
    assignedToName?: string;
  }>;
}

export interface ApproveGateRequest {
  gateId: string;
}

export interface RejectGateRequest {
  gateId: string;
  reason: string;
}

export interface RequestChangesRequest {
  gateId: string;
  comment: string;
}

export interface AddCommentRequest {
  gateId: string;
  text: string;
}

export interface AssignGateRequest {
  gateId: string;
  userId: string;
  userName: string;
}
