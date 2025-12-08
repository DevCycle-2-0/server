import { PriorityLevel } from '@shared/types';

export interface CreateFeatureDto {
  title: string;
  description?: string;
  productId?: string;
  priority?: PriorityLevel;
  storyPoints?: number;
  assigneeId?: string;
  tags?: string[];
  dueDate?: Date;
}
