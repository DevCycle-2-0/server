import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";
import { Priority } from "@modules/features/domain/entities/Feature";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "testing"
  | "done"
  | "blocked";

export type TaskType =
  | "frontend"
  | "backend"
  | "mobile_android"
  | "mobile_ios"
  | "api"
  | "design"
  | "qa"
  | "devops"
  | "documentation"
  | "other";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface TaskDependency {
  taskId: string;
  taskTitle: string;
  type: "blocks" | "blocked_by";
}

interface TaskProps {
  title: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  priority: Priority;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  estimatedHours?: number;
  loggedHours: number;
  dueDate?: Date;
  completedAt?: Date;
  subtasks: Subtask[];
  dependencies: TaskDependency[];
  labels: string[];
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Task extends AggregateRoot<TaskProps> {
  private constructor(props: TaskProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get type(): TaskType {
    return this.props.type;
  }

  get priority(): Priority {
    return this.props.priority;
  }

  get featureId(): string | undefined {
    return this.props.featureId;
  }

  get featureTitle(): string | undefined {
    return this.props.featureTitle;
  }

  get sprintId(): string | undefined {
    return this.props.sprintId;
  }

  get sprintName(): string | undefined {
    return this.props.sprintName;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get assigneeName(): string | undefined {
    return this.props.assigneeName;
  }

  get assigneeAvatar(): string | undefined {
    return this.props.assigneeAvatar;
  }

  get estimatedHours(): number | undefined {
    return this.props.estimatedHours;
  }

  get loggedHours(): number {
    return this.props.loggedHours;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get subtasks(): Subtask[] {
    return this.props.subtasks;
  }

  get dependencies(): TaskDependency[] {
    return this.props.dependencies;
  }

  get labels(): string[] {
    return this.props.labels;
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
    title?: string,
    description?: string,
    type?: TaskType,
    priority?: Priority,
    estimatedHours?: number,
    labels?: string[]
  ): void {
    if (title) this.props.title = title;
    if (description !== undefined) this.props.description = description;
    if (type) this.props.type = type;
    if (priority) this.props.priority = priority;
    if (estimatedHours !== undefined)
      this.props.estimatedHours = estimatedHours;
    if (labels) this.props.labels = labels;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: TaskStatus): void {
    this.props.status = status;
    if (status === "done") {
      this.props.completedAt = new Date();
    } else if (this.props.completedAt) {
      this.props.completedAt = undefined;
    }
    this.props.updatedAt = new Date();
  }

  public assign(
    assigneeId: string,
    assigneeName: string,
    assigneeAvatar?: string
  ): void {
    this.props.assigneeId = assigneeId;
    this.props.assigneeName = assigneeName;
    this.props.assigneeAvatar = assigneeAvatar;
    this.props.updatedAt = new Date();
  }

  public unassign(): void {
    this.props.assigneeId = undefined;
    this.props.assigneeName = undefined;
    this.props.assigneeAvatar = undefined;
    this.props.updatedAt = new Date();
  }

  public addTimeLog(hours: number): void {
    this.props.loggedHours += hours;
    this.props.updatedAt = new Date();
  }

  public addSubtask(title: string): Subtask {
    const subtask: Subtask = {
      id: uuidv4(),
      title,
      completed: false,
    };
    this.props.subtasks.push(subtask);
    this.props.updatedAt = new Date();
    return subtask;
  }

  public updateSubtask(
    subtaskId: string,
    title?: string,
    completed?: boolean
  ): boolean {
    const subtask = this.props.subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return false;

    if (title) subtask.title = title;
    if (completed !== undefined) {
      subtask.completed = completed;
      subtask.completedAt = completed ? new Date() : undefined;
    }
    this.props.updatedAt = new Date();
    return true;
  }

  public deleteSubtask(subtaskId: string): boolean {
    const index = this.props.subtasks.findIndex((st) => st.id === subtaskId);
    if (index === -1) return false;

    this.props.subtasks.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public toggleSubtask(subtaskId: string): boolean {
    const subtask = this.props.subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return false;

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : undefined;
    this.props.updatedAt = new Date();
    return true;
  }

  public addDependency(
    taskId: string,
    taskTitle: string,
    type: "blocks" | "blocked_by"
  ): void {
    // Check if dependency already exists
    const exists = this.props.dependencies.some((dep) => dep.taskId === taskId);
    if (!exists) {
      this.props.dependencies.push({ taskId, taskTitle, type });
      this.props.updatedAt = new Date();
    }
  }

  public addToSprint(sprintId: string, sprintName: string): void {
    this.props.sprintId = sprintId;
    this.props.sprintName = sprintName;
    this.props.updatedAt = new Date();
  }

  public removeFromSprint(): void {
    this.props.sprintId = undefined;
    this.props.sprintName = undefined;
    this.props.updatedAt = new Date();
  }

  public removeDependency(taskId: string): boolean {
    const index = this.props.dependencies.findIndex(
      (dep) => dep.taskId === taskId
    );
    if (index === -1) return false;

    this.props.dependencies.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public static create(
    props: {
      title: string;
      description: string;
      type: TaskType;
      priority: Priority;
      workspaceId: string;
      status?: TaskStatus;
      featureId?: string;
      featureTitle?: string;
      sprintId?: string;
      sprintName?: string;
      assigneeId?: string;
      assigneeName?: string;
      assigneeAvatar?: string;
      estimatedHours?: number;
      dueDate?: Date;
      labels?: string[];
    },
    id?: string
  ): Task {
    return new Task(
      {
        title: props.title,
        description: props.description,
        status: props.status || "backlog",
        type: props.type,
        priority: props.priority,
        featureId: props.featureId,
        featureTitle: props.featureTitle,
        sprintId: props.sprintId,
        sprintName: props.sprintName,
        assigneeId: props.assigneeId,
        assigneeName: props.assigneeName,
        assigneeAvatar: props.assigneeAvatar,
        estimatedHours: props.estimatedHours,
        loggedHours: 0,
        dueDate: props.dueDate,
        subtasks: [],
        dependencies: [],
        labels: props.labels || [],
        workspaceId: props.workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
