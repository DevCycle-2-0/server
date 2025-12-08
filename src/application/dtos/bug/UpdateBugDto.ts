import { BugSeverity, PriorityLevel } from '@shared/types';

export interface UpdateBugDto {
  title?: string;
  description?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: Record<string, any>;
  severity?: BugSeverity;
  priority?: PriorityLevel;
  sprintId?: string | null;
  assigneeId?: string | null;
  tags?: string[];
  attachments?: any[];
}
