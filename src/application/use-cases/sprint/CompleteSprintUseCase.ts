import { ISprintRepository } from "@domain/repositories/ISprintRepository";
import { NotFoundError, ValidationError } from "@shared/errors/AppError";
import { SprintStatus } from "@shared/types";

export class CompleteSprintUseCase {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(sprintId: string, velocity: number) {
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundError("Sprint not found");
    }

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new ValidationError("Only active sprints can be completed");
    }

    sprint.complete(velocity);
    return this.sprintRepository.update(sprintId, sprint);
  }
}
