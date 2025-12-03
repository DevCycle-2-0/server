import { ISprintRepository } from '@core/domain/repositories/ISprintRepository';
import { NotFoundError } from '@core/shared/errors/DomainError';

interface StartSprintInput {
  sprintId: string;
}

export class StartSprint {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: StartSprintInput): Promise<void> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      throw new NotFoundError('Sprint');
    }

    sprint.start();
    await this.sprintRepository.update(sprint);
  }
}
