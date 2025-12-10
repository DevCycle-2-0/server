import {
  PlanId,
  BillingInterval,
  SubscriptionStatus,
} from "@modules/billing/domain/entities/Subscription";

import { PaymentStatus } from "@modules/billing/domain/entities/Invoice";

export interface PlanLimits {
  products: number;
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
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
}

export interface SubscriptionDto {
  id: string;
  userId: string;
  workspaceId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string;
}

export interface UsageDto {
  products: number;
  teamMembers: number;
  features: number;
  storage: number;
}

export interface InvoiceDto {
  id: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  invoiceUrl?: string;
}

export interface PaymentMethodDto {
  id: string;
  type: "card";
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface CreateSubscriptionRequest {
  planId: PlanId;
  interval: BillingInterval;
}

export interface UpdateSubscriptionRequest {
  planId: PlanId;
}

export interface AddPaymentMethodRequest {
  token: string;
}
