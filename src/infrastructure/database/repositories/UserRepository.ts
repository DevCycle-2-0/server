import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { UserModel } from '../models/UserModel';
import { Email } from '@domain/value-objects/Email';

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const created = await UserModel.create({
      id: user.id,
      email: user.email.getValue(),
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      locale: user.locale,
      emailVerified: user.emailVerified,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: any = {};

    if (data.email) updateData.email = data.email.getValue();
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.passwordHash) updateData.passwordHash = data.passwordHash;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.timezone) updateData.timezone = data.timezone;
    if (data.locale) updateData.locale = data.locale;
    if (data.emailVerified !== undefined)
      updateData.emailVerified = data.emailVerified;

    await UserModel.update(updateData, { where: { id } });
    const updated = await UserModel.findByPk(id);
    if (!updated) throw new Error('User not found');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }

  private toDomain(model: UserModel): User {
    return new User(
      model.id,
      new Email(model.email),
      model.fullName,
      model.passwordHash,
      model.avatarUrl,
      model.timezone,
      model.locale,
      model.emailVerified,
      model.createdAt,
      model.updatedAt
    );
  }
}
