import { PriorityLevel } from '@shared/types';

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: PriorityLevel;
  storyPoints?: number;
  estimatedHours?: number;
  assigneeId?: string | null;
  tags?: string[];
  dueDate?: Date | null;
}
