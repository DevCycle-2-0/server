import { Entity } from "@shared/domain/Entity";
import { v4 as uuidv4 } from "uuid";

export type PaymentMethodType = "card";

interface PaymentMethodProps {
  userId: string;
  type: PaymentMethodType;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentMethod extends Entity<PaymentMethodProps> {
  private constructor(props: PaymentMethodProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): PaymentMethodType {
    return this.props.type;
  }

  get last4(): string {
    return this.props.last4;
  }

  get brand(): string {
    return this.props.brand;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public setAsDefault(): void {
    this.props.isDefault = true;
    this.props.updatedAt = new Date();
  }

  public unsetAsDefault(): void {
    this.props.isDefault = false;
    this.props.updatedAt = new Date();
  }

  public isExpired(): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (this.props.expiryYear < currentYear) {
      return true;
    }
    if (
      this.props.expiryYear === currentYear &&
      this.props.expiryMonth < currentMonth
    ) {
      return true;
    }
    return false;
  }

  public static create(
    props: {
      userId: string;
      type: PaymentMethodType;
      last4: string;
      brand: string;
      expiryMonth: number;
      expiryYear: number;
      isDefault?: boolean;
      stripePaymentMethodId?: string;
    },
    id?: string
  ): PaymentMethod {
    return new PaymentMethod(
      {
        userId: props.userId,
        type: props.type,
        last4: props.last4,
        brand: props.brand,
        expiryMonth: props.expiryMonth,
        expiryYear: props.expiryYear,
        isDefault: props.isDefault || false,
        stripePaymentMethodId: props.stripePaymentMethodId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
