import { IReleaseRepository } from "@domain/repositories/IReleaseRepository";
import { NotFoundError, ValidationError } from "@shared/errors/AppError";
import { ReleaseStatus } from "@shared/types";

export class PublishReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string, userId: string) {
    const release = await this.releaseRepository.findById(releaseId);
    if (!release) {
      throw new NotFoundError("Release not found");
    }

    if (release.status === ReleaseStatus.RELEASED) {
      throw new ValidationError("Release already published");
    }

    release.publish(userId);
    return this.releaseRepository.update(releaseId, release);
  }
}
