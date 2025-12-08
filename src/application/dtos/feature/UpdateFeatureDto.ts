import { PriorityLevel } from '@shared/types';

export interface UpdateFeatureDto {
  title?: string;
  description?: string;
  priority?: PriorityLevel;
  storyPoints?: number;
  assigneeId?: string;
  tags?: string[];
  dueDate?: Date;
}
