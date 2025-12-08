import { IBugRepository } from '@domain/repositories/IBugRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { UpdateBugDto } from '@application/dtos/bug/UpdateBugDto';

export class UpdateBugUseCase {
  constructor(private bugRepository: IBugRepository) {}

  async execute(bugId: string, dto: UpdateBugDto) {
    const bug = await this.bugRepository.findById(bugId);
    if (!bug) {
      throw new NotFoundError('Bug not found');
    }

    bug.update(dto);
    return this.bugRepository.update(bugId, bug);
  }
}
