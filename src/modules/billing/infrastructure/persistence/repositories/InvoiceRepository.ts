import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import { IInvoiceRepository } from "@modules/billing/domain/repositories/IInvoiceRepository";
import {
  Invoice,
  PaymentStatus,
} from "@modules/billing/domain/entities/Invoice";
import { InvoiceModel } from "../models/InvoiceModel";

export class InvoiceRepository
  extends BaseRepository<Invoice, InvoiceModel>
  implements IInvoiceRepository
{
  constructor() {
    super(InvoiceModel);
  }

  protected toDomain(model: InvoiceModel): Invoice {
    const invoice = Invoice.create(
      {
        subscriptionId: model.subscriptionId,
        amount: Number(model.amount),
        status: model.status as PaymentStatus,
        invoiceUrl: model.invoiceUrl,
        stripeInvoiceId: model.stripeInvoiceId,
      },
      model.id
    );

    (invoice as any).props.paidAt = model.paidAt;
    (invoice as any).props.createdAt = model.createdAt;
    (invoice as any).props.updatedAt = model.updatedAt;

    return invoice;
  }

  protected toModel(domain: any): Partial<InvoiceModel> {
    return {
      id: domain.id,
      subscriptionId: domain.subscriptionId,
      amount: domain.amount,
      status: domain.status,
      invoiceUrl: domain.invoiceUrl,
      paidAt: domain.paidAt,
      stripeInvoiceId: domain.stripeInvoiceId,
    };
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    const models = await this.model.findAll({
      where: { subscriptionId },
      order: [["createdAt", "DESC"]],
    });
    return models.map((model) => this.toDomain(model));
  }
}
