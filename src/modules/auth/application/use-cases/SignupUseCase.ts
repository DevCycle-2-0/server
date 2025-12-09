import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IUserRepository } from "@modules/auth/domain/repositories/IUserRepository";
import { IWorkspaceRepository } from "@modules/auth/domain/repositories/IWorkspaceRepository";
import { User } from "@modules/auth/domain/entities/User";
import { Workspace } from "@modules/auth/domain/entities/Workspace";
import { Email } from "@modules/auth/domain/value-objects/Email";
import { Password } from "@modules/auth/domain/value-objects/Password";
import { PasswordHasher } from "@modules/auth/infrastructure/security/PasswordHasher";
import { JwtService } from "@modules/auth/infrastructure/security/JwtService";
import { TokenService } from "@modules/auth/infrastructure/security/TokenService";
import { SignupRequest, AuthResponseDto } from "../dtos/AuthRequestDtos";

export class SignupUseCase
  implements UseCase<SignupRequest, Result<AuthResponseDto>>
{
  constructor(
    private userRepository: IUserRepository,
    private workspaceRepository: IWorkspaceRepository
  ) {}

  async execute(request: SignupRequest): Promise<Result<AuthResponseDto>> {
    // Validate email
    const emailOrError = Email.create(request.email);
    if (emailOrError.isFailure) {
      return Result.fail<AuthResponseDto>(emailOrError.error!);
    }

    const email = emailOrError.getValue();

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return Result.fail<AuthResponseDto>(
        "User with this email already exists"
      );
    }

    // Validate password
    const passwordOrError = Password.create(request.password);
    if (passwordOrError.isFailure) {
      return Result.fail<AuthResponseDto>(passwordOrError.error!);
    }

    // Hash password
    const hashedPassword = await PasswordHasher.hash(request.password);
    const hashedPasswordOrError = Password.createHashed(hashedPassword);
    if (hashedPasswordOrError.isFailure) {
      return Result.fail<AuthResponseDto>("Error processing password");
    }

    // Create workspace first (user needs workspace)
    const workspace = Workspace.create({
      name: request.workspaceName || `${request.name}'s Workspace`,
      ownerId: "temp", // Will be updated after user creation
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // Create user
    const user = User.create({
      email,
      password: hashedPasswordOrError.getValue(),
      name: request.name,
      workspaceId: savedWorkspace.id,
    });

    // Update workspace owner
    const updatedWorkspace = Workspace.create(
      {
        name: savedWorkspace.name,
        ownerId: user.id,
        slug: savedWorkspace.slug,
      },
      savedWorkspace.id
    );
    await this.workspaceRepository.save(updatedWorkspace);

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate verification token (for email verification)
    const verificationToken = TokenService.generateVerificationToken(
      savedUser.id
    );
    // TODO: Send verification email

    // Generate auth tokens
    const tokens = JwtService.generateTokens({
      userId: savedUser.id,
      workspaceId: savedUser.workspaceId,
      email: savedUser.email.value,
    });

    const response: AuthResponseDto = {
      user: {
        id: savedUser.id,
        email: savedUser.email.value,
        name: savedUser.name,
        avatar: savedUser.avatar,
        emailVerified: savedUser.emailVerified,
        workspaceId: savedUser.workspaceId,
        createdAt: savedUser.createdAt.toISOString(),
        updatedAt: savedUser.updatedAt.toISOString(),
      },
      tokens,
    };

    return Result.ok<AuthResponseDto>(response);
  }
}
