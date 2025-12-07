import { PriorityLevel } from "@shared/types";

export interface CreateTaskDto {
  title: string;
  description?: string;
  type?: string;
  priority?: PriorityLevel;
  storyPoints?: number;
  estimatedHours?: number;
  productId?: string;
  featureId?: string;
  sprintId?: string;
  parentTaskId?: string;
  assigneeId?: string;
  tags?: string[];
  dueDate?: Date;
}
