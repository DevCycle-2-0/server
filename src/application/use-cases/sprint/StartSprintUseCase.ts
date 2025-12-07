import { ISprintRepository } from "@domain/repositories/ISprintRepository";
import { NotFoundError, ValidationError } from "@shared/errors/AppError";
import { SprintStatus } from "@shared/types";

export class StartSprintUseCase {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(sprintId: string) {
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundError("Sprint not found");
    }

    if (sprint.status !== SprintStatus.PLANNING) {
      throw new ValidationError("Sprint must be in planning status to start");
    }

    sprint.start();
    return this.sprintRepository.update(sprintId, sprint);
  }
}
