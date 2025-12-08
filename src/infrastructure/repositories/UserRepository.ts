import { IUserRepository } from "@domain/repositories/IUserRepository";
import { User } from "@domain/entities/User.entity";
import { Workspace } from "@domain/entities/Workspace.entity";
import { AppError } from "@shared/errors/AppError";

export class UserRepository implements IUserRepository {
  async create(data: Partial<User>): Promise<User> {
    return await User.create(data as any);
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      include: [{ model: Workspace }],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) throw AppError.notFound("User not found");
    return await user.update(data);
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) throw AppError.notFound("User not found");
    await user.destroy();
  }
}
