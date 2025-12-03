import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { UnauthorizedError } from '@core/shared/errors/DomainError';

interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserOutput {
  userId: string;
  email: string;
  name: string;
  workspaceId?: string;
}

export class LoginUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(input.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    user.updateLastLogin();
    await this.userRepository.update(user);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      workspaceId: user.workspaceId,
    };
  }
}
