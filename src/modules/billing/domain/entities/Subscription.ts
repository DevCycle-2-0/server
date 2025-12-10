import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";

export type PlanId = "free" | "pro" | "team" | "enterprise";
export type BillingInterval = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";

interface SubscriptionProps {
  userId: string;
  workspaceId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription extends AggregateRoot<SubscriptionProps> {
  private constructor(props: SubscriptionProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get userId(): string {
    return this.props.userId;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get planId(): PlanId {
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public changePlan(newPlanId: PlanId): void {
    if (this.props.status === "cancelled" || this.props.status === "expired") {
      throw new Error(
        "Cannot change plan for cancelled or expired subscription"
      );
    }
    this.props.planId = newPlanId;
    this.props.updatedAt = new Date();
  }

  public changeInterval(newInterval: BillingInterval): void {
    if (this.props.status === "cancelled" || this.props.status === "expired") {
      throw new Error(
        "Cannot change interval for cancelled or expired subscription"
      );
    }
    this.props.interval = newInterval;
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.props.status === "expired") {
      throw new Error("Cannot cancel expired subscription");
    }
    this.props.cancelAtPeriodEnd = true;
    this.props.updatedAt = new Date();
  }

  public reactivate(): void {
    if (this.props.status === "expired") {
      throw new Error("Cannot reactivate expired subscription");
    }
    this.props.cancelAtPeriodEnd = false;
    this.props.status = "active";
    this.props.updatedAt = new Date();
  }

  public expire(): void {
    this.props.status = "expired";
    this.props.updatedAt = new Date();
  }

  public renew(nextPeriodEnd: Date): void {
    this.props.currentPeriodStart = this.props.currentPeriodEnd;
    this.props.currentPeriodEnd = nextPeriodEnd;
    this.props.status = "active";
    this.props.cancelAtPeriodEnd = false;
    this.props.updatedAt = new Date();
  }

  public endTrial(): void {
    if (!this.props.trialEndsAt) {
      throw new Error("Subscription is not in trial");
    }
    this.props.status = "active";
    this.props.trialEndsAt = undefined;
    this.props.updatedAt = new Date();
  }

  public static create(
    props: {
      userId: string;
      workspaceId: string;
      planId: PlanId;
      interval: BillingInterval;
      status?: SubscriptionStatus;
      trialDays?: number;
    },
    id?: string
  ): Subscription {
    const now = new Date();
    const periodEnd = new Date(now);

    if (props.interval === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    let trialEndsAt: Date | undefined;
    if (props.trialDays && props.trialDays > 0) {
      trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + props.trialDays);
    }

    return new Subscription(
      {
        userId: props.userId,
        workspaceId: props.workspaceId,
        planId: props.planId,
        status: props.status || (trialEndsAt ? "trial" : "active"),
        interval: props.interval,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        trialEndsAt,
        createdAt: now,
        updatedAt: now,
      },
      id
    );
  }
}
