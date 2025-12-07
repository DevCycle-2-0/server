import { v4 as uuidv4 } from "uuid";
import { IReleaseRepository } from "@domain/repositories/IReleaseRepository";
import { Release } from "@domain/entities/Release";
import { CreateReleaseDto } from "@application/dtos/release/CreateReleaseDto";

export class CreateReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(dto: CreateReleaseDto, workspaceId: string, userId: string) {
    const releaseId = uuidv4();
    const release = Release.create(
      releaseId,
      workspaceId,
      dto.version,
      dto.releaseType,
      userId
    );

    if (dto.name) release.name = dto.name;
    if (dto.description) release.description = dto.description;
    if (dto.productId) release.productId = dto.productId;
    if (dto.targetDate) release.targetDate = dto.targetDate;
    if (dto.pipelineConfig) release.pipelineConfig = dto.pipelineConfig;

    return this.releaseRepository.create(release);
  }
}
