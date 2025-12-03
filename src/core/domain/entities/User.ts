import { BaseEntity } from './BaseEntity';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { ValidationError } from '@core/shared/errors/DomainError';

interface UserProps {
  email: Email;
  password: Password;
  name: string;
  avatar?: string;
  workspaceId?: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
}

export class User extends BaseEntity<UserProps> {
  private constructor(id: string, private props: UserProps, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
  }

  static async create(email: string, password: string, name: string, id?: string): Promise<User> {
    const emailVO = Email.create(email);
    const passwordVO = await Password.create(password);

    if (!name || name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long');
    }

    return new User(id || crypto.randomUUID(), {
      email: emailVO,
      password: passwordVO,
      name: name.trim(),
      emailVerified: false,
      isActive: true,
    });
  }

  static reconstitute(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
    avatar: string | null,
    workspaceId: string | null,
    emailVerified: boolean,
    isActive: boolean,
    lastLoginAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(
      id,
      {
        email: Email.create(email),
        password: Password.fromHash(passwordHash),
        name,
        avatar: avatar || undefined,
        workspaceId: workspaceId || undefined,
        emailVerified,
        isActive,
        lastLoginAt: lastLoginAt || undefined,
      },
      createdAt,
      updatedAt
    );
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return this.props.password.compare(plainPassword);
  }

  updateProfile(name?: string, avatar?: string): void {
    if (name && name.trim().length >= 2) {
      this.props.name = name.trim();
      this.touch();
    }

    if (avatar !== undefined) {
      this.props.avatar = avatar;
      this.touch();
    }
  }

  verifyEmail(): void {
    this.props.emailVerified = true;
    this.touch();
  }

  updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.touch();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  activate(): void {
    this.props.isActive = true;
    this.touch();
  }

  joinWorkspace(workspaceId: string): void {
    this.props.workspaceId = workspaceId;
    this.touch();
  }

  // Getters
  get email(): string {
    return this.props.email.getValue();
  }
  get passwordHash(): string {
    return this.props.password.getHash();
  }
  get name(): string {
    return this.props.name;
  }
  get avatar(): string | undefined {
    return this.props.avatar;
  }
  get workspaceId(): string | undefined {
    return this.props.workspaceId;
  }
  get emailVerified(): boolean {
    return this.props.emailVerified;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }
}
