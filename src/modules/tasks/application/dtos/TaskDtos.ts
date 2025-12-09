import { TaskStatus, TaskType } from "@modules/tasks/domain/entities/Task";
import { Priority } from "@modules/features/domain/entities/Feature";

export interface SubtaskDto {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface TaskDependencyDto {
  taskId: string;
  taskTitle: string;
  type: "blocks" | "blocked_by";
}

export interface TaskDto {
  id: string;
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
  dueDate?: string;
  completedAt?: string;
  subtasks: SubtaskDto[];
  dependencies: TaskDependencyDto[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  featureId?: string;
  sprintId?: string;
  assigneeId?: string;
  estimatedHours?: number;
  dueDate?: string;
  labels?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: Priority;
  estimatedHours?: number;
  labels?: string[];
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface CreateTimeLogRequest {
  hours: number;
  date: string;
  description?: string;
}

export interface TimeLogDto {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  date: string;
  description?: string;
  createdAt: string;
}

export interface CreateSubtaskRequest {
  title: string;
}

export interface UpdateSubtaskRequest {
  title?: string;
  completed?: boolean;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentDto {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDependencyRequest {
  dependsOnTaskId: string;
  type: "blocks" | "blocked_by";
}

export interface GetTasksQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  featureId?: string;
  sprintId?: string;
  assigneeId?: string;
  search?: string;
}
