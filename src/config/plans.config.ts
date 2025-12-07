export interface PlanLimits {
  products: number; // -1 for unlimited
  teamMembers: number;
  featuresPerMonth: number;
  storage: string;
  advancedAnalytics: boolean;
  customWorkflows: boolean;
  prioritySupport: boolean;
  sso: boolean;
  apiAccess: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
  stripePriceIds?: {
    monthly?: string;
    yearly?: string;
  };
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1 Product',
      'Up to 3 Team Members',
      '10 Features per month',
      '100 MB Storage',
      'Basic Analytics',
      'Community Support',
    ],
    limits: {
      products: 1,
      teamMembers: 3,
      featuresPerMonth: 10,
      storage: '100 MB',
      advancedAnalytics: false,
      customWorkflows: false,
      prioritySupport: false,
      sso: false,
      apiAccess: false,
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_FREE_MONTHLY,
      yearly: process.env.STRIPE_PRICE_FREE_YEARLY,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For growing product teams',
    monthlyPrice: 29,
    yearlyPrice: 290, // ~2 months free
    popular: true,
    features: [
      'Unlimited Products',
      'Up to 10 Team Members',
      'Unlimited Features',
      '10 GB Storage',
      'Advanced Analytics',
      'Custom Workflows',
      'API Access',
      'Email Support',
    ],
    limits: {
      products: -1,
      teamMembers: 10,
      featuresPerMonth: -1,
      storage: '10 GB',
      advancedAnalytics: true,
      customWorkflows: true,
      prioritySupport: false,
      sso: false,
      apiAccess: true,
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
  },
  team: {
    id: 'team',
    name: 'Team',
    description: 'For larger teams',
    monthlyPrice: 79,
    yearlyPrice: 790, // ~2 months free
    features: [
      'Unlimited Products',
      'Up to 50 Team Members',
      'Unlimited Features',
      '100 GB Storage',
      'Advanced Analytics',
      'Custom Workflows',
      'Priority Support',
      'API Access',
      'Dedicated Account Manager',
    ],
    limits: {
      products: -1,
      teamMembers: 50,
      featuresPerMonth: -1,
      storage: '100 GB',
      advancedAnalytics: true,
      customWorkflows: true,
      prioritySupport: true,
      sso: false,
      apiAccess: true,
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY,
      yearly: process.env.STRIPE_PRICE_TEAM_YEARLY,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Unlimited Everything',
      'Unlimited Team Members',
      'Unlimited Storage',
      'Advanced Analytics',
      'Custom Workflows',
      'SSO & SAML',
      '24/7 Priority Support',
      'Dedicated Support',
      'Custom Integrations',
      'SLA Guarantee',
      'On-premise Deployment',
    ],
    limits: {
      products: -1,
      teamMembers: -1,
      featuresPerMonth: -1,
      storage: 'Unlimited',
      advancedAnalytics: true,
      customWorkflows: true,
      prioritySupport: true,
      sso: true,
      apiAccess: true,
    },
  },
};

export const getPlan = (planId: string): Plan | null => {
  return PLANS[planId] || null;
};

export const getAllPlans = (): Plan[] => {
  return Object.values(PLANS);
};

export const getStripePriceId = (planId: string, interval: 'monthly' | 'yearly'): string | null => {
  const plan = getPlan(planId);
  if (!plan || !plan.stripePriceIds) return null;
  return plan.stripePriceIds[interval] || null;
};
