import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import { IPaymentMethodRepository } from "@modules/billing/domain/repositories/IPaymentMethodRepository";
import {
  PaymentMethod,
  PaymentMethodType,
} from "@modules/billing/domain/entities/PaymentMethod";
import { PaymentMethodModel } from "../models/PaymentMethodModel";

export class PaymentMethodRepository
  extends BaseRepository<PaymentMethod, PaymentMethodModel>
  implements IPaymentMethodRepository
{
  constructor() {
    super(PaymentMethodModel);
  }

  protected toDomain(model: PaymentMethodModel): PaymentMethod {
    const paymentMethod = PaymentMethod.create(
      {
        userId: model.userId,
        type: model.type as PaymentMethodType,
        last4: model.last4,
        brand: model.brand,
        expiryMonth: model.expiryMonth,
        expiryYear: model.expiryYear,
        isDefault: model.isDefault,
        stripePaymentMethodId: model.stripePaymentMethodId,
      },
      model.id
    );

    (paymentMethod as any).props.createdAt = model.createdAt;
    (paymentMethod as any).props.updatedAt = model.updatedAt;

    return paymentMethod;
  }

  protected toModel(domain: PaymentMethod): Partial<PaymentMethodModel> {
    return {
      id: domain.id,
      userId: domain.userId,
      type: domain.type,
      last4: domain.last4,
      brand: domain.brand,
      expiryMonth: domain.expiryMonth,
      expiryYear: domain.expiryYear,
      isDefault: domain.isDefault,
      stripePaymentMethodId: domain.stripePaymentMethodId,
    };
  }

  async findByUserId(userId: string): Promise<PaymentMethod[]> {
    const models = await this.model.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    return models.map((model) => this.toDomain(model));
  }

  async findDefaultByUserId(userId: string): Promise<PaymentMethod | null> {
    const model = await this.model.findOne({
      where: { userId, isDefault: true },
    });
    return model ? this.toDomain(model) : null;
  }
}
