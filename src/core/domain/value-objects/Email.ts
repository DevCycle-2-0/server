import { ValidationError } from '@core/shared/errors/DomainError';

export class Email {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  static create(email: string): Email {
    return new Email(email.toLowerCase().trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
