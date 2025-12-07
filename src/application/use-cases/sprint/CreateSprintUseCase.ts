import { v4 as uuidv4 } from "uuid";
import { ISprintRepository } from "@domain/repositories/ISprintRepository";
import { Sprint } from "@domain/entities/Sprint";
import { CreateSprintDto } from "@application/dtos/sprint/CreateSprintDto";
import { ValidationError } from "@shared/errors/AppError";

export class CreateSprintUseCase {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(dto: CreateSprintDto, workspaceId: string, userId: string) {
    // Validate dates
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new ValidationError("End date must be after start date");
    }

    const sprintId = uuidv4();
    const sprint = Sprint.create(
      sprintId,
      workspaceId,
      dto.name,
      new Date(dto.startDate),
      new Date(dto.endDate),
      userId
    );

    if (dto.goal) sprint.goal = dto.goal;
    if (dto.productId) sprint.productId = dto.productId;
    if (dto.capacityPoints) sprint.capacityPoints = dto.capacityPoints;

    return this.sprintRepository.create(sprint);
  }
}
