import { SubscriptionPlan, AppRole } from "@shared/types";

export class Workspace {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public ownerId: string,
    public subscriptionPlan: SubscriptionPlan = SubscriptionPlan.FREE,
    public subscriptionStatus: string = "active",
    public logoUrl?: string,
    public settings: Record<string, any> = {},
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    name: string,
    slug: string,
    ownerId: string
  ): Workspace {
    return new Workspace(id, name, slug, ownerId);
  }

  update(data: {
    name?: string;
    logoUrl?: string;
    settings?: Record<string, any>;
  }): void {
    if (data.name) this.name = data.name;
    if (data.logoUrl !== undefined) this.logoUrl = data.logoUrl;
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
    }
    this.updatedAt = new Date();
  }

  upgradePlan(plan: SubscriptionPlan): void {
    this.subscriptionPlan = plan;
    this.updatedAt = new Date();
  }
}
