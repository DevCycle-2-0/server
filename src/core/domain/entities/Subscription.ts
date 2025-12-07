import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
}

export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

interface SubscriptionProps {
  userId: string;
  workspaceId: string;
  planId: string;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export class Subscription extends BaseEntity<SubscriptionProps> {
  private constructor(
    id: string,
    private props: SubscriptionProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    userId: string,
    workspaceId: string,
    planId: string,
    interval: BillingInterval,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    id?: string
  ): Subscription {
    if (!['free', 'pro', 'team', 'enterprise'].includes(planId)) {
      throw new ValidationError(`Invalid plan ID: ${planId}`);
    }

    return new Subscription(id || crypto.randomUUID(), {
      userId,
      workspaceId,
      planId,
      status: SubscriptionStatus.ACTIVE,
      interval,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
  }

  static reconstitute(
    id: string,
    userId: string,
    workspaceId: string,
    planId: string,
    status: SubscriptionStatus,
    interval: BillingInterval,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: boolean,
    trialEndsAt: Date | null,
    stripeSubscriptionId: string | null,
    stripeCustomerId: string | null,
    createdAt: Date,
    updatedAt: Date
  ): Subscription {
    return new Subscription(
      id,
      {
        userId,
        workspaceId,
        planId,
        status,
        interval,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        trialEndsAt: trialEndsAt || undefined,
        stripeSubscriptionId: stripeSubscriptionId || undefined,
        stripeCustomerId: stripeCustomerId || undefined,
      },
      createdAt,
      updatedAt
    );
  }

  changePlan(planId: string, interval: BillingInterval): void {
    if (!['free', 'pro', 'team', 'enterprise'].includes(planId)) {
      throw new ValidationError(`Invalid plan ID: ${planId}`);
    }

    this.props.planId = planId;
    this.props.interval = interval;
    this.touch();
  }

  cancel(): void {
    if (this.props.status === SubscriptionStatus.CANCELED) {
      throw new ValidationError('Subscription is already canceled');
    }

    this.props.cancelAtPeriodEnd = true;
    this.touch();
  }

  reactivate(): void {
    if (!this.props.cancelAtPeriodEnd) {
      throw new ValidationError('Subscription is not set to cancel');
    }

    this.props.cancelAtPeriodEnd = false;
    this.touch();
  }

  updateStatus(status: SubscriptionStatus): void {
    this.props.status = status;
    this.touch();
  }

  updatePeriod(start: Date, end: Date): void {
    this.props.currentPeriodStart = start;
    this.props.currentPeriodEnd = end;
    this.touch();
  }

  setStripeIds(subscriptionId: string, customerId: string): void {
    this.props.stripeSubscriptionId = subscriptionId;
    this.props.stripeCustomerId = customerId;
    this.touch();
  }

  startTrial(endsAt: Date): void {
    this.props.status = SubscriptionStatus.TRIALING;
    this.props.trialEndsAt = endsAt;
    this.touch();
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get planId(): string {
    return this.props.planId;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get interval(): BillingInterval {
    return this.props.interval;
  }

  get currentPeriodStart(): Date {
    return this.props.currentPeriodStart;
  }

  get currentPeriodEnd(): Date {
    return this.props.currentPeriodEnd;
  }

  get cancelAtPeriodEnd(): boolean {
    return this.props.cancelAtPeriodEnd;
  }

  get trialEndsAt(): Date | undefined {
    return this.props.trialEndsAt;
  }

  get stripeSubscriptionId(): string | undefined {
    return this.props.stripeSubscriptionId;
  }

  get stripeCustomerId(): string | undefined {
    return this.props.stripeCustomerId;
  }

  isActive(): boolean {
    return this.props.status === SubscriptionStatus.ACTIVE;
  }

  isTrialing(): boolean {
    return this.props.status === SubscriptionStatus.TRIALING;
  }

  isCanceled(): boolean {
    return this.props.status === SubscriptionStatus.CANCELED;
  }

  isPastDue(): boolean {
    return this.props.status === SubscriptionStatus.PAST_DUE;
  }
}
