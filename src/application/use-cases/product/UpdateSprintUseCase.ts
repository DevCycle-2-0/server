import { ISprintRepository } from '@domain/repositories/ISprintRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { UpdateSprintDto } from '@application/dtos/sprint/UpdateSprintDto';

export class UpdateSprintUseCase {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(sprintId: string, dto: UpdateSprintDto) {
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundError('Sprint not found');
    }

    sprint.update(dto);
    return this.sprintRepository.update(sprintId, sprint);
  }
}
