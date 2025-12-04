import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { User } from '@core/domain/entities/User';
import { UserModel } from '../models/UserModel';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userModel: any = await UserModel.findByPk(id);
    if (!userModel) return null;

    // Add null checks and use getDataValue to ensure we get the actual value
    const email = userModel.getDataValue('email') || userModel.email;
    const passwordHash = userModel.getDataValue('password_hash') || userModel.password_hash;
    const name = userModel.getDataValue('name') || userModel.name;

    if (!email || !passwordHash || !name) {
      console.error('Missing required fields for user:', {
        id,
        email,
        name,
        hasPassword: !!passwordHash,
      });
      return null;
    }

    return User.reconstitute(
      userModel.id,
      email,
      passwordHash,
      name,
      userModel.avatar || null,
      userModel.workspace_id || null,
      userModel.email_verified,
      userModel.is_active,
      userModel.last_login_at || null,
      userModel.created_at,
      userModel.updated_at
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const userModel: any = await UserModel.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!userModel) return null;

    const userEmail = userModel.getDataValue('email') || userModel.email;
    const passwordHash = userModel.getDataValue('password_hash') || userModel.password_hash;
    const userName = userModel.getDataValue('name') || userModel.name;

    if (!userEmail || !passwordHash || !userName) {
      console.error('Missing required fields for user:', {
        email: userEmail,
        name: userName,
        hasPassword: !!passwordHash,
      });
      return null;
    }

    return User.reconstitute(
      userModel.id,
      userEmail,
      passwordHash,
      userName,
      userModel.avatar || null,
      userModel.workspace_id || null,
      userModel.email_verified,
      userModel.is_active,
      userModel.last_login_at || null,
      userModel.created_at,
      userModel.updated_at
    );
  }

  async save(user: User): Promise<void> {
    await UserModel.create({
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      name: user.name,
      avatar: user.avatar,
      workspace_id: user.workspaceId,
      email_verified: user.emailVerified,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
    });
  }

  async update(user: User): Promise<void> {
    await UserModel.update(
      {
        email: user.email,
        password_hash: user.passwordHash,
        name: user.name,
        avatar: user.avatar,
        workspace_id: user.workspaceId,
        email_verified: user.emailVerified,
        is_active: user.isActive,
        last_login_at: user.lastLoginAt,
        updated_at: user.updatedAt,
      },
      {
        where: { id: user.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }
}
