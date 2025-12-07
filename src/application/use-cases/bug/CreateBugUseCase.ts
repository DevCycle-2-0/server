import { v4 as uuidv4 } from "uuid";
import { IBugRepository } from "@domain/repositories/IBugRepository";
import { Bug } from "@domain/entities/Bug";
import { CreateBugDto } from "@application/dtos/bug/CreateBugDto";

export class CreateBugUseCase {
  constructor(private bugRepository: IBugRepository) {}

  async execute(dto: CreateBugDto, workspaceId: string, userId: string) {
    const bugId = uuidv4();
    const bug = Bug.create(
      bugId,
      workspaceId,
      dto.title,
      userId,
      dto.severity,
      dto.description
    );

    if (dto.stepsToReproduce) bug.stepsToReproduce = dto.stepsToReproduce;
    if (dto.expectedBehavior) bug.expectedBehavior = dto.expectedBehavior;
    if (dto.actualBehavior) bug.actualBehavior = dto.actualBehavior;
    if (dto.environment) bug.environment = dto.environment;
    if (dto.priority) bug.priority = dto.priority;
    if (dto.productId) bug.productId = dto.productId;
    if (dto.featureId) bug.featureId = dto.featureId;
    if (dto.tags) bug.tags = dto.tags;
    if (dto.attachments) bug.attachments = dto.attachments;

    return this.bugRepository.create(bug);
  }
}
