import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";

export type GateType =
  | "design_review"
  | "technical_review"
  | "security_review"
  | "release_approval";
export type GateStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";
export type WorkflowStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "rejected";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface ApprovalGate {
  id: string;
  type: GateType;
  label: string;
  order: number;
  status: GateStatus;
  assignedTo?: string;
  assignedToName?: string;
  approvedAt?: Date;
  approvedBy?: string;
  approvedByName?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectedByName?: string;
  comments: Comment[];
}

interface ApprovalWorkflowProps {
  featureId: string;
  status: WorkflowStatus;
  currentGateIndex: number;
  gates: ApprovalGate[];
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ApprovalWorkflow extends AggregateRoot<ApprovalWorkflowProps> {
  private constructor(props: ApprovalWorkflowProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get featureId(): string {
    return this.props.featureId;
  }

  get status(): WorkflowStatus {
    return this.props.status;
  }

  get currentGateIndex(): number {
    return this.props.currentGateIndex;
  }

  get gates(): ApprovalGate[] {
    return this.props.gates;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public approveGate(
    gateId: string,
    userId: string,
    userName: string
  ): boolean {
    const gate = this.props.gates.find((g) => g.id === gateId);
    if (!gate || gate.status !== "pending") {
      return false;
    }

    gate.status = "approved";
    gate.approvedAt = new Date();
    gate.approvedBy = userId;
    gate.approvedByName = userName;

    // Move to next gate if available
    const currentGateIndex = this.props.gates.findIndex((g) => g.id === gateId);
    if (currentGateIndex < this.props.gates.length - 1) {
      this.props.currentGateIndex = currentGateIndex + 1;
      this.props.status = "in_progress";
    } else {
      // All gates completed
      this.props.status = "completed";
    }

    this.props.updatedAt = new Date();
    return true;
  }

  public rejectGate(
    gateId: string,
    userId: string,
    userName: string,
    reason: string
  ): boolean {
    const gate = this.props.gates.find((g) => g.id === gateId);
    if (!gate || gate.status !== "pending") {
      return false;
    }

    gate.status = "rejected";
    gate.rejectedAt = new Date();
    gate.rejectedBy = userId;
    gate.rejectedByName = userName;

    // Add rejection comment
    gate.comments.push({
      id: uuidv4(),
      userId,
      userName,
      text: reason,
      createdAt: new Date(),
    });

    this.props.status = "rejected";
    this.props.updatedAt = new Date();
    return true;
  }

  public requestChanges(
    gateId: string,
    userId: string,
    userName: string,
    comment: string
  ): boolean {
    const gate = this.props.gates.find((g) => g.id === gateId);
    if (!gate || gate.status !== "pending") {
      return false;
    }

    gate.status = "changes_requested";
    gate.comments.push({
      id: uuidv4(),
      userId,
      userName,
      text: comment,
      createdAt: new Date(),
    });

    this.props.updatedAt = new Date();
    return true;
  }

  public addComment(
    gateId: string,
    userId: string,
    userName: string,
    text: string
  ): boolean {
    const gate = this.props.gates.find((g) => g.id === gateId);
    if (!gate) {
      return false;
    }

    gate.comments.push({
      id: uuidv4(),
      userId,
      userName,
      text,
      createdAt: new Date(),
    });

    this.props.updatedAt = new Date();
    return true;
  }

  public assignGate(gateId: string, userId: string, userName: string): boolean {
    const gate = this.props.gates.find((g) => g.id === gateId);
    if (!gate) {
      return false;
    }

    gate.assignedTo = userId;
    gate.assignedToName = userName;
    this.props.updatedAt = new Date();
    return true;
  }

  public static create(
    props: {
      featureId: string;
      workspaceId: string;
      gates?: ApprovalGate[];
    },
    id?: string
  ): ApprovalWorkflow {
    const defaultGates: ApprovalGate[] = props.gates || [
      {
        id: uuidv4(),
        type: "design_review",
        label: "Design Review",
        order: 1,
        status: "pending",
        comments: [],
      },
      {
        id: uuidv4(),
        type: "technical_review",
        label: "Technical Review",
        order: 2,
        status: "pending",
        comments: [],
      },
      {
        id: uuidv4(),
        type: "security_review",
        label: "Security Review",
        order: 3,
        status: "pending",
        comments: [],
      },
      {
        id: uuidv4(),
        type: "release_approval",
        label: "Release Approval",
        order: 4,
        status: "pending",
        comments: [],
      },
    ];

    return new ApprovalWorkflow(
      {
        featureId: props.featureId,
        status: "in_progress",
        currentGateIndex: 0,
        gates: defaultGates,
        workspaceId: props.workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
