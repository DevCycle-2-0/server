import { PaymentMethod } from "../entities/PaymentMethod";

export interface IPaymentMethodRepository {
  findById(id: string): Promise<PaymentMethod | null>;
  findByUserId(userId: string): Promise<PaymentMethod[]>;
  findDefaultByUserId(userId: string): Promise<PaymentMethod | null>;
  save(paymentMethod: PaymentMethod): Promise<PaymentMethod>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
