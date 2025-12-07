import bcrypt from "bcryptjs";

export class Password {
  private readonly value: string;

  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed && !this.isValid(password)) {
      throw new Error(
        "Password must be at least 8 characters with 1 uppercase and 1 number"
      );
    }
    this.value = password;
  }

  private isValid(password: string): boolean {
    return (
      password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    );
  }

  async hash(): Promise<string> {
    return bcrypt.hash(this.value, 10);
  }

  async compare(hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(this.value, hashedPassword);
  }

  getValue(): string {
    return this.value;
  }
}
