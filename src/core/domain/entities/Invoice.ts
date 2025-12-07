import { BaseEntity } from './BaseEntity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible',
}

interface InvoiceProps {
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paidAt?: Date;
  invoiceUrl?: string;
  invoicePdf?: string;
  stripeInvoiceId?: string;
}

export class Invoice extends BaseEntity<InvoiceProps> {
  private constructor(
    id: string,
    private props: InvoiceProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    subscriptionId: string,
    amount: number,
    currency: string = 'USD',
    id?: string
  ): Invoice {
    return new Invoice(id || crypto.randomUUID(), {
      subscriptionId,
      amount,
      currency,
      status: InvoiceStatus.DRAFT,
    });
  }

  static reconstitute(
    id: string,
    subscriptionId: string,
    amount: number,
    currency: string,
    status: InvoiceStatus,
    paidAt: Date | null,
    invoiceUrl: string | null,
    invoicePdf: string | null,
    stripeInvoiceId: string | null,
    createdAt: Date,
    updatedAt: Date
  ): Invoice {
    return new Invoice(
      id,
      {
        subscriptionId,
        amount,
        currency,
        status,
        paidAt: paidAt || undefined,
        invoiceUrl: invoiceUrl || undefined,
        invoicePdf: invoicePdf || undefined,
        stripeInvoiceId: stripeInvoiceId || undefined,
      },
      createdAt,
      updatedAt
    );
  }

  markPaid(): void {
    this.props.status = InvoiceStatus.PAID;
    this.props.paidAt = new Date();
    this.touch();
  }

  setStripeInvoiceId(invoiceId: string): void {
    this.props.stripeInvoiceId = invoiceId;
    this.touch();
  }

  setUrls(invoiceUrl: string, invoicePdf: string): void {
    this.props.invoiceUrl = invoiceUrl;
    this.props.invoicePdf = invoicePdf;
    this.touch();
  }

  // Getters
  get subscriptionId(): string {
    return this.props.subscriptionId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  get invoiceUrl(): string | undefined {
    return this.props.invoiceUrl;
  }

  get invoicePdf(): string | undefined {
    return this.props.invoicePdf;
  }

  get stripeInvoiceId(): string | undefined {
    return this.props.stripeInvoiceId;
  }

  isPaid(): boolean {
    return this.props.status === InvoiceStatus.PAID;
  }
}
