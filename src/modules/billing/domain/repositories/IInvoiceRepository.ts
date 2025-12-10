import { Invoice } from "../entities/Invoice";

export interface IInvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
