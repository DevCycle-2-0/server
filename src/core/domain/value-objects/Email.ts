import { ValidationError } from '@core/shared/errors/DomainError';

export class Email {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required and must be a string');
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new ValidationError('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new ValidationError('Invalid email format');
    }
  }

  static create(email: string): Email {
    if (!email) {
      throw new ValidationError('Email is required');
    }
    return new Email(email.toLowerCase().trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
