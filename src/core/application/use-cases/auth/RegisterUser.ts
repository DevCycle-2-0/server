import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { User } from '@core/domain/entities/User';
import { ConflictError } from '@core/shared/errors/DomainError';

interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

interface RegisterUserOutput {
  userId: string;
  email: string;
  name: string;
}

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create new user
    const user = await User.create(input.email, input.password, input.name);

    // Save to repository
    await this.userRepository.save(user);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
