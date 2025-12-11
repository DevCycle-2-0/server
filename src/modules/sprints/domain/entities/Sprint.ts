// src/modules/sprints/domain/entities/Sprint.ts
import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";

export type SprintStatus = "planning" | "active" | "completed" | "cancelled";

export interface SprintRetrospective {
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
  savedAt?: Date;
  savedBy?: string;
  savedByName?: string;
}

interface SprintProps {
  name: string;
  goal: string;
  productId: string;
  productName: string;
  status: SprintStatus;
  startDate: Date;
  endDate: Date;
  taskIds: string[];
  bugIds: string[];
  capacity: number;
  velocity?: number;
  retrospective?: SprintRetrospective;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Sprint extends AggregateRoot<SprintProps> {
  private constructor(props: SprintProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get name(): string {
    return this.props.name;
  }

  get goal(): string {
    return this.props.goal;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get status(): SprintStatus {
    return this.props.status;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get taskIds(): string[] {
    return this.props.taskIds;
  }

  get bugIds(): string[] {
    return this.props.bugIds;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get velocity(): number | undefined {
    return this.props.velocity;
  }

  get retrospective(): SprintRetrospective | undefined {
    return this.props.retrospective;
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

  public update(
    name?: string,
    goal?: string,
    startDate?: Date,
    endDate?: Date,
    capacity?: number
  ): void {
    if (this.props.status !== "planning") {
      throw new Error("Can only update sprints in planning status");
    }

    if (name) this.props.name = name;
    if (goal) this.props.goal = goal;
    if (startDate) this.props.startDate = startDate;
    if (endDate) {
      if (this.props.startDate && endDate <= this.props.startDate) {
        throw new Error("End date must be after start date");
      }
      this.props.endDate = endDate;
    }
    if (capacity !== undefined) this.props.capacity = capacity;
    this.props.updatedAt = new Date();
  }

  public start(): void {
    if (this.props.status !== "planning") {
      throw new Error("Can only start sprints in planning status");
    }
    this.props.status = "active";
    this.props.updatedAt = new Date();
  }

  public complete(velocity?: number): void {
    if (this.props.status !== "active") {
      throw new Error("Can only complete active sprints");
    }
    this.props.status = "completed";
    if (velocity !== undefined) {
      this.props.velocity = velocity;
    }
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    if (
      this.props.status === "completed" ||
      this.props.status === "cancelled"
    ) {
      throw new Error("Cannot cancel completed or already cancelled sprints");
    }
    this.props.status = "cancelled";
    this.props.updatedAt = new Date();
  }

  public addTask(taskId: string): void {
    if (!this.props.taskIds.includes(taskId)) {
      this.props.taskIds.push(taskId);
      this.props.updatedAt = new Date();
    }
  }

  public removeTask(taskId: string): boolean {
    const index = this.props.taskIds.indexOf(taskId);
    if (index === -1) return false;

    this.props.taskIds.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public addBug(bugId: string): void {
    if (!this.props.bugIds.includes(bugId)) {
      this.props.bugIds.push(bugId);
      this.props.updatedAt = new Date();
    }
  }

  public removeBug(bugId: string): boolean {
    const index = this.props.bugIds.indexOf(bugId);
    if (index === -1) return false;

    this.props.bugIds.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public saveRetrospective(
    wentWell: string[],
    needsImprovement: string[],
    actionItems: string[],
    savedBy: string,
    savedByName: string
  ): void {
    if (this.props.status !== "completed") {
      throw new Error("Can only save retrospective for completed sprints");
    }

    this.props.retrospective = {
      wentWell,
      needsImprovement,
      actionItems,
      savedAt: new Date(),
      savedBy,
      savedByName,
    };
    this.props.updatedAt = new Date();
  }

  public static create(
    props: {
      name: string;
      goal: string;
      productId: string;
      productName: string;
      startDate: Date;
      endDate: Date;
      capacity?: number; // Make optional
      workspaceId: string;
      status?: SprintStatus;
      taskIds?: string[];
      bugIds?: string[];
      velocity?: number;
    },
    id?: string
  ): Sprint {
    if (props.endDate <= props.startDate) {
      throw new Error("End date must be after start date");
    }

    return new Sprint(
      {
        name: props.name,
        goal: props.goal,
        productId: props.productId,
        productName: props.productName,
        status: props.status || "planning",
        startDate: props.startDate,
        endDate: props.endDate,
        taskIds: props.taskIds || [],
        bugIds: props.bugIds || [],
        capacity: props.capacity ?? 0, // FIX: Default to 0 if not provided
        velocity: props.velocity,
        workspaceId: props.workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
