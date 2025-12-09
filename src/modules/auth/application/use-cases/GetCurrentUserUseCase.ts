import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IUserRepository } from "@modules/auth/domain/repositories/IUserRepository";
import { AuthUserDto } from "../dtos/AuthResponseDtos";

export class GetCurrentUserUseCase
  implements UseCase<string, Result<AuthUserDto>>
{
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<Result<AuthUserDto>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail<AuthUserDto>("User not found");
    }

    const response: AuthUserDto = {
      id: user.id,
      email: user.email.value,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      workspaceId: user.workspaceId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return Result.ok<AuthUserDto>(response);
  }
}
