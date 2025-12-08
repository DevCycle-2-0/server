import { IReleaseRepository } from '@domain/repositories/IReleaseRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { UpdateReleaseDto } from '@application/dtos/release/UpdateReleaseDto';

export class UpdateReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string, dto: UpdateReleaseDto) {
    const release = await this.releaseRepository.findById(releaseId);
    if (!release) {
      throw new NotFoundError('Release not found');
    }

    release.update(dto);
    return this.releaseRepository.update(releaseId, release);
  }
}
