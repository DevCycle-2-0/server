import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { JwtService } from "@infrastructure/services/JwtService";
import { AppError } from "@shared/errors/AppError";
import { Workspace } from "@domain/entities/Workspace.entity";

export interface SignupDTO {
  email: string;
  password: string;
  name: string;
  workspaceName?: string;
}

export class SignupUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: SignupDTO) {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw AppError.conflict("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create workspace
    const workspace = await Workspace.create({
      name: data.workspaceName || `${data.name}'s Workspace`,
      slug: data.email.split("@")[0] + "-" + uuidv4().substring(0, 8),
    });

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      workspaceId: workspace.id,
    });

    // Update workspace owner
    await workspace.update({ ownerId: user.id });

    // Generate tokens
    const accessToken = JwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = JwtService.generateRefreshToken({
      userId: user.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspaceId,
      },
      tokens: { accessToken, refreshToken, expiresIn: 3600 },
    };
  }
}
