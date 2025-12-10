import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";
import { Platform } from "@modules/products/domain/entities/Product";

export type FeatureStatus =
  | "idea"
  | "review"
  | "approved"
  | "planning"
  | "design"
  | "development"
  | "testing"
  | "release"
  | "live"
  | "rejected";

export type Priority = "low" | "medium" | "high" | "critical";

interface FeatureProps {
  title: string;
  description: string;
  status: FeatureStatus;
  priority: Priority;
  productId: string;
  productName: string;
  platform: Platform;
  requestedBy: string;
  requestedByName: string;
  assigneeId?: string;
  assigneeName?: string;
  sprintId?: string;
  sprintName?: string;
  votes: number;
  votedBy: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Feature extends AggregateRoot<FeatureProps> {
  private constructor(props: FeatureProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  // Getters
  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): FeatureStatus {
    return this.props.status;
  }

  get priority(): Priority {
    return this.props.priority;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get platform(): Platform {
    return this.props.platform;
  }

  get requestedBy(): string {
    return this.props.requestedBy;
  }

  get requestedByName(): string {
    return this.props.requestedByName;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get assigneeName(): string | undefined {
    return this.props.assigneeName;
  }

  get sprintId(): string | undefined {
    return this.props.sprintId;
  }

  get sprintName(): string | undefined {
    return this.props.sprintName;
  }

  get votes(): number {
    return this.props.votes;
  }

  get votedBy(): string[] {
    return this.props.votedBy;
  }

  get estimatedHours(): number | undefined {
    return this.props.estimatedHours;
  }

  get actualHours(): number | undefined {
    return this.props.actualHours;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get tags(): string[] {
    return this.props.tags;
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

  // Business Methods
  public update(
    title?: string,
    description?: string,
    priority?: Priority,
    estimatedHours?: number,
    tags?: string[]
  ): void {
    if (title) this.props.title = title;
    if (description !== undefined) this.props.description = description;
    if (priority) this.props.priority = priority;
    if (estimatedHours !== undefined)
      this.props.estimatedHours = estimatedHours;
    if (tags) this.props.tags = tags;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: FeatureStatus): boolean {
    // Validate status transition
    const validTransitions: Record<FeatureStatus, FeatureStatus[]> = {
      idea: ["review", "rejected"],
      review: ["approved", "rejected"],
      approved: ["planning"],
      planning: ["design"],
      design: ["development"],
      development: ["testing"],
      testing: ["development", "release"],
      release: ["live"],
      live: [],
      rejected: [],
    };

    if (!validTransitions[this.props.status].includes(status)) {
      return false;
    }

    this.props.status = status;
    if (status === "live") {
      this.props.completedAt = new Date();
    }
    this.props.updatedAt = new Date();
    return true;
  }

  public vote(userId: string): void {
    if (!this.props.votedBy.includes(userId)) {
      this.props.votedBy.push(userId);
      this.props.votes++;
      this.props.updatedAt = new Date();
    }
  }

  public unvote(userId: string): void {
    const index = this.props.votedBy.indexOf(userId);
    if (index !== -1) {
      this.props.votedBy.splice(index, 1);
      this.props.votes--;
      this.props.updatedAt = new Date();
    }
  }

  public assignToSprint(sprintId: string, sprintName: string): void {
    this.props.sprintId = sprintId;
    this.props.sprintName = sprintName;
    this.props.updatedAt = new Date();
  }

  public unassignFromSprint(): void {
    this.props.sprintId = undefined;
    this.props.sprintName = undefined;
    this.props.updatedAt = new Date();
  }

  public approve(): void {
    this.props.status = "approved";
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    this.props.status = "rejected";
    this.props.updatedAt = new Date();
  }

  // Factory Method
  public static create(
    props: {
      title: string;
      description: string;
      priority: Priority;
      productId: string;
      productName: string;
      platform: Platform;
      requestedBy: string;
      requestedByName: string;
      workspaceId: string;
      status?: FeatureStatus;
      assigneeId?: string;
      assigneeName?: string;
      sprintId?: string;
      sprintName?: string;
      estimatedHours?: number;
      dueDate?: Date;
      tags?: string[];
    },
    id?: string
  ): Feature {
    return new Feature(
      {
        title: props.title,
        description: props.description,
        status: props.status || "idea",
        priority: props.priority,
        productId: props.productId,
        productName: props.productName,
        platform: props.platform,
        requestedBy: props.requestedBy,
        requestedByName: props.requestedByName,
        assigneeId: props.assigneeId,
        assigneeName: props.assigneeName,
        sprintId: props.sprintId,
        sprintName: props.sprintName,
        votes: 0,
        votedBy: [],
        estimatedHours: props.estimatedHours,
        dueDate: props.dueDate,
        tags: props.tags || [],
        workspaceId: props.workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
