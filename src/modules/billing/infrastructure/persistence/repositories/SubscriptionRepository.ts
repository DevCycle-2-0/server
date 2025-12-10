import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import { ISubscriptionRepository } from "@modules/billing/domain/repositories/ISubscriptionRepository";
import {
  Subscription,
  PlanId,
  BillingInterval,
  SubscriptionStatus,
} from "@modules/billing/domain/entities/Subscription";
import { SubscriptionModel } from "../models/SubscriptionModel";

export class SubscriptionRepository
  extends BaseRepository<Subscription, SubscriptionModel>
  implements ISubscriptionRepository
{
  constructor() {
    super(SubscriptionModel);
  }

  protected toDomain(model: SubscriptionModel): Subscription {
    const subscription = Subscription.create(
      {
        userId: model.userId,
        workspaceId: model.workspaceId,
        planId: model.planId as PlanId,
        interval: model.interval as BillingInterval,
        status: model.status as SubscriptionStatus,
        trialDays: 0,
      },
      model.id
    );

    // Restore all properties
    (subscription as any).props.currentPeriodStart = model.currentPeriodStart;
    (subscription as any).props.currentPeriodEnd = model.currentPeriodEnd;
    (subscription as any).props.cancelAtPeriodEnd = model.cancelAtPeriodEnd;
    (subscription as any).props.trialEndsAt = model.trialEndsAt;
    (subscription as any).props.createdAt = model.createdAt;
    (subscription as any).props.updatedAt = model.updatedAt;

    return subscription;
  }

  protected toModel(domain: Subscription): Partial<SubscriptionModel> {
    return {
      id: domain.id,
      userId: domain.userId,
      workspaceId: domain.workspaceId,
      planId: domain.planId,
      status: domain.status,
      interval: domain.interval,
      currentPeriodStart: domain.currentPeriodStart,
      currentPeriodEnd: domain.currentPeriodEnd,
      cancelAtPeriodEnd: domain.cancelAtPeriodEnd,
      trialEndsAt: domain.trialEndsAt,
    };
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const model = await this.model.findOne({ where: { userId } });
    return model ? this.toDomain(model) : null;
  }

  async findByWorkspaceId(workspaceId: string): Promise<Subscription | null> {
    const model = await this.model.findOne({ where: { workspaceId } });
    return model ? this.toDomain(model) : null;
  }
}
