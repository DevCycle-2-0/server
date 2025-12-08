import bcrypt from "bcryptjs";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { JwtService } from "@infrastructure/services/JwtService";
import { AppError } from "@shared/errors/AppError";

export interface LoginDTO {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: LoginDTO) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw AppError.unauthorized("Invalid credentials");
    }

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
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        workspaceId: user.workspaceId,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    };
  }
}
