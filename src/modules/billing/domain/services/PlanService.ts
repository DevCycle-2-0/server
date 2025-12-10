import { Plan } from "@modules/billing/application/dtos/BillingDtos";
import {
  PlanId,
  BillingInterval,
} from "@modules/billing/domain/entities/Subscription";

export class PlanService {
  private static plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      description: "For individuals and small teams getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Up to 3 products",
        "Up to 5 team members",
        "Basic analytics",
        "5GB storage",
        "Community support",
      ],
      limits: {
        products: 3,
        teamMembers: 5,
        featuresPerMonth: 50,
        storage: "5GB",
        advancedAnalytics: false,
        customWorkflows: false,
        prioritySupport: false,
        sso: false,
        apiAccess: false,
      },
    },
    {
      id: "pro",
      name: "Pro",
      description: "For growing teams that need more power",
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        "Up to 10 products",
        "Up to 20 team members",
        "Advanced analytics",
        "50GB storage",
        "Priority support",
        "API access",
      ],
      limits: {
        products: 10,
        teamMembers: 20,
        featuresPerMonth: 200,
        storage: "50GB",
        advancedAnalytics: true,
        customWorkflows: false,
        prioritySupport: true,
        sso: false,
        apiAccess: true,
      },
      popular: true,
    },
    {
      id: "team",
      name: "Team",
      description: "For larger teams with advanced needs",
      monthlyPrice: 79,
      yearlyPrice: 790,
      features: [
        "Up to 50 products",
        "Up to 100 team members",
        "Advanced analytics",
        "Custom workflows",
        "200GB storage",
        "Priority support",
        "API access",
      ],
      limits: {
        products: 50,
        teamMembers: 100,
        featuresPerMonth: 1000,
        storage: "200GB",
        advancedAnalytics: true,
        customWorkflows: true,
        prioritySupport: true,
        sso: false,
        apiAccess: true,
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For organizations with custom requirements",
      monthlyPrice: 299,
      yearlyPrice: 2990,
      features: [
        "Unlimited products",
        "Unlimited team members",
        "Advanced analytics",
        "Custom workflows",
        "Unlimited storage",
        "Dedicated support",
        "SSO integration",
        "API access",
        "Custom integrations",
      ],
      limits: {
        products: -1, // Unlimited
        teamMembers: -1, // Unlimited
        featuresPerMonth: -1, // Unlimited
        storage: "Unlimited",
        advancedAnalytics: true,
        customWorkflows: true,
        prioritySupport: true,
        sso: true,
        apiAccess: true,
      },
    },
  ];

  public static getAllPlans(): Plan[] {
    return this.plans;
  }

  public static getPlanById(planId: PlanId): Plan | null {
    return this.plans.find((p) => p.id === planId) || null;
  }

  public static getPlanPrice(
    planId: PlanId,
    interval: BillingInterval
  ): number {
    const plan = this.getPlanById(planId);
    if (!plan) return 0;
    return interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  }

  public static canUpgrade(currentPlanId: PlanId, newPlanId: PlanId): boolean {
    const planOrder: PlanId[] = ["free", "pro", "team", "enterprise"];
    const currentIndex = planOrder.indexOf(currentPlanId);
    const newIndex = planOrder.indexOf(newPlanId);
    return newIndex > currentIndex;
  }

  public static canDowngrade(
    currentPlanId: PlanId,
    newPlanId: PlanId
  ): boolean {
    const planOrder: PlanId[] = ["free", "pro", "team", "enterprise"];
    const currentIndex = planOrder.indexOf(currentPlanId);
    const newIndex = planOrder.indexOf(newPlanId);
    return newIndex < currentIndex;
  }
}
