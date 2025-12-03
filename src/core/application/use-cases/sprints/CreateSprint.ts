import { ISprintRepository } from '@core/domain/repositories/ISprintRepository';
import { Sprint, SprintDuration } from '@core/domain/entities/Sprint';

interface CreateSprintInput {
  workspaceId: string;
  productId: string;
  name: string;
  startDate: Date;
  duration: SprintDuration;
  goal?: string;
}

interface CreateSprintOutput {
  sprintId: string;
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
}

export class CreateSprint {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: CreateSprintInput): Promise<CreateSprintOutput> {
    const sprint = Sprint.create(
      input.workspaceId,
      input.productId,
      input.name,
      input.startDate,
      input.duration,
      input.goal
    );

    await this.sprintRepository.save(sprint);

    return {
      sprintId: sprint.id,
      name: sprint.name,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    };
  }
}
