import bcrypt from 'bcrypt';

export class Password {
  private constructor(
    private readonly hashedValue: string,
    private readonly isHashed: boolean = true
  ) {}

  static async create(plainPassword: string): Promise<Password> {
    if (plainPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(plainPassword)) {
      throw new ValidationError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    }

    const hashed = await bcrypt.hash(plainPassword, 12);
    return new Password(hashed, true);
  }

  static fromHash(hash: string): Password {
    return new Password(hash, true);
  }

  async compare(plainPassword: string): Promise<boolean> {
    if (!this.isHashed) {
      throw new Error('Cannot compare non-hashed password');
    }
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  getHash(): string {
    return this.hashedValue;
  }
}
