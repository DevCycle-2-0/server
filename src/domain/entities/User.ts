import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";
import { AppRole } from "@shared/types";

export class User {
  constructor(
    public id: string,
    public email: Email,
    public fullName: string,
    public passwordHash: string,
    public avatarUrl?: string,
    public timezone: string = "UTC",
    public locale: string = "en",
    public emailVerified: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    email: string,
    fullName: string,
    password: string
  ): User {
    const emailVO = new Email(email);
    return new User(id, emailVO, fullName, password);
  }

  async setPassword(password: Password): Promise<void> {
    this.passwordHash = await password.hash();
  }

  async validatePassword(password: Password): Promise<boolean> {
    return password.compare(this.passwordHash);
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  updateProfile(data: {
    fullName?: string;
    avatarUrl?: string;
    timezone?: string;
    locale?: string;
  }): void {
    if (data.fullName) this.fullName = data.fullName;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
    if (data.timezone) this.timezone = data.timezone;
    if (data.locale) this.locale = data.locale;
    this.updatedAt = new Date();
  }
}
