import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

interface PaymentMethodProps {
  userId: string;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

export class PaymentMethod extends BaseEntity<PaymentMethodProps> {
  private constructor(
    id: string,
    private props: PaymentMethodProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    userId: string,
    type: string,
    brand: string,
    last4: string,
    expiryMonth: number,
    expiryYear: number,
    id?: string
  ): PaymentMethod {
    if (last4.length !== 4) {
      throw new ValidationError('last4 must be 4 digits');
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      throw new ValidationError('Invalid expiry month');
    }

    return new PaymentMethod(id || crypto.randomUUID(), {
      userId,
      type,
      brand,
      last4,
      expiryMonth,
      expiryYear,
      isDefault: false,
    });
  }

  static reconstitute(
    id: string,
    userId: string,
    type: string,
    brand: string,
    last4: string,
    expiryMonth: number,
    expiryYear: number,
    isDefault: boolean,
    stripePaymentMethodId: string | null,
    createdAt: Date,
    updatedAt: Date
  ): PaymentMethod {
    return new PaymentMethod(
      id,
      {
        userId,
        type,
        brand,
        last4,
        expiryMonth,
        expiryYear,
        isDefault,
        stripePaymentMethodId: stripePaymentMethodId || undefined,
      },
      createdAt,
      updatedAt
    );
  }

  setDefault(): void {
    this.props.isDefault = true;
    this.touch();
  }

  unsetDefault(): void {
    this.props.isDefault = false;
    this.touch();
  }

  setStripePaymentMethodId(paymentMethodId: string): void {
    this.props.stripePaymentMethodId = paymentMethodId;
    this.touch();
  }

  isExpired(): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (this.props.expiryYear < currentYear) return true;
    if (this.props.expiryYear === currentYear && this.props.expiryMonth < currentMonth) return true;
    return false;
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get type(): string {
    return this.props.type;
  }

  get brand(): string {
    return this.props.brand;
  }

  get last4(): string {
    return this.props.last4;
  }

  get expiryMonth(): number {
    return this.props.expiryMonth;
  }

  get expiryYear(): number {
    return this.props.expiryYear;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get stripePaymentMethodId(): string | undefined {
    return this.props.stripePaymentMethodId;
  }
}
