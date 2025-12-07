import { IBugRepository } from "@domain/repositories/IBugRepository";
import { NotFoundError } from "@shared/errors/AppError";

export class ResolveBugUseCase {
  constructor(private bugRepository: IBugRepository) {}

  async execute(bugId: string, resolution: string) {
    const bug = await this.bugRepository.findById(bugId);
    if (!bug) {
      throw new NotFoundError("Bug not found");
    }

    bug.resolve(resolution);
    return this.bugRepository.update(bugId, bug);
  }
}
