import { BugSeverity, PriorityLevel } from "@shared/types";

export interface CreateBugDto {
  title: string;
  description?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: Record<string, any>;
  severity: BugSeverity;
  priority?: PriorityLevel;
  productId?: string;
  featureId?: string;
  tags?: string[];
  attachments?: any[];
}
