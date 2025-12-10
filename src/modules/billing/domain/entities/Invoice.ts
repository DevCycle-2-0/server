import { Entity } from "@shared/domain/Entity";
import { v4 as uuidv4 } from "uuid";
export type PaymentStatus = "paid" | "pending" | "failed";

interface InvoiceProps {
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  invoiceUrl?: string;
  paidAt?: Date;
  stripeInvoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Invoice extends Entity<InvoiceProps> {
  private constructor(props: InvoiceProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get subscriptionId(): string {
    return this.props.subscriptionId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get invoiceUrl(): string | undefined {
    return this.props.invoiceUrl;
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  get stripeInvoiceId(): string | undefined {
    return this.props.stripeInvoiceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public markAsPaid(): void {
    this.props.status = "paid";
    this.props.paidAt = new Date();
    this.props.updatedAt = new Date();
  }

  public markAsFailed(): void {
    this.props.status = "failed";
    this.props.updatedAt = new Date();
  }

  public static create(
    props: {
      subscriptionId: string;
      amount: number;
      status?: PaymentStatus;
      invoiceUrl?: string;
      stripeInvoiceId?: string;
    },
    id?: string
  ): Invoice {
    return new Invoice(
      {
        subscriptionId: props.subscriptionId,
        amount: props.amount,
        status: props.status || "pending",
        invoiceUrl: props.invoiceUrl,
        stripeInvoiceId: props.stripeInvoiceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
