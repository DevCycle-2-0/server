import { ISprintRepository } from '@core/domain/repositories/ISprintRepository';
import { ITaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { NotFoundError } from '@core/shared/errors/DomainError';

interface SprintMetricsOutput {
  sprintId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completionPercentage: number;
  velocity: number;
  daysRemaining: number;
}

export class GetSprintMetrics {
  constructor(
    private sprintRepository: ISprintRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(sprintId: string): Promise<SprintMetricsOutput> {
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundError('Sprint');
    }

    const tasks = await this.taskRepository.findBySprint(sprintId);

    const completedTasks = tasks.filter((t) => t.isCompleted()).length;
    const inProgressTasks = tasks.filter((t) => t.isInProgress()).length;
    const blockedTasks = tasks.filter((t) => t.isBlocked).length;

    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    const completionPercentage =
      tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return {
      sprintId: sprint.id,
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      totalEstimatedHours,
      totalActualHours,
      completionPercentage,
      velocity: sprint.velocity,
      daysRemaining: sprint.getDaysRemaining(),
    };
  }
}
