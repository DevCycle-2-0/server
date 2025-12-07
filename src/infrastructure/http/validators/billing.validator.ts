import { z } from 'zod';

/**
 * Schema for creating checkout session
 * POST /billing/checkout
 */
export const createCheckoutSchema = z.object({
  body: z.object({
    planId: z.enum(['free', 'pro', 'team', 'enterprise'], {
      errorMap: () => ({ message: 'Invalid plan ID' }),
    }),
    interval: z.enum(['monthly', 'yearly'], {
      errorMap: () => ({ message: 'Interval must be monthly or yearly' }),
    }),
  }),
});

/**
 * Schema for updating subscription
 * PATCH /billing/subscription
 */
export const updateSubscriptionSchema = z.object({
  body: z
    .object({
      planId: z.enum(['free', 'pro', 'team', 'enterprise']).optional(),
      interval: z.enum(['monthly', 'yearly']).optional(),
    })
    .refine((data) => data.planId !== undefined || data.interval !== undefined, {
      message: 'At least one field (planId or interval) must be provided',
    }),
});

/**
 * Schema for adding payment method
 * POST /billing/payment-methods
 */
export const addPaymentMethodSchema = z.object({
  body: z.object({
    type: z.enum(['card'], {
      errorMap: () => ({ message: 'Only card payment method is supported' }),
    }),
    brand: z.string().min(1, 'Brand is required').max(50),
    last4: z.string().length(4, 'Last 4 digits must be exactly 4 characters'),
    expiryMonth: z
      .number()
      .int()
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12'),
    expiryYear: z
      .number()
      .int()
      .min(new Date().getFullYear(), 'Year cannot be in the past')
      .max(new Date().getFullYear() + 20, 'Year cannot be more than 20 years in the future'),
    isDefault: z.boolean().optional(),
  }),
});

/**
 * Schema for getting plan by ID
 * GET /billing/plans/:id
 */
export const getPlanSchema = z.object({
  params: z.object({
    id: z.enum(['free', 'pro', 'team', 'enterprise'], {
      errorMap: () => ({ message: 'Invalid plan ID' }),
    }),
  }),
});

/**
 * Schema for getting invoice by ID
 * GET /billing/invoices/:id
 */
export const getInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
});

/**
 * Schema for getting usage
 * GET /billing/usage
 */
export const getUsageSchema = z.object({
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
  }),
});

/**
 * Schema for listing invoices with filters
 * GET /billing/invoices
 */
export const listInvoicesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

/**
 * Schema for removing payment method
 * DELETE /billing/payment-methods/:id
 */
export const removePaymentMethodSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment method ID'),
  }),
});

/**
 * Schema for setting default payment method
 * PATCH /billing/payment-methods/:id/default
 */
export const setDefaultPaymentMethodSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment method ID'),
  }),
});

/**
 * Schema for webhook events (if implementing Stripe webhooks)
 * POST /billing/webhooks/stripe
 */
export const stripeWebhookSchema = z.object({
  body: z.object({
    id: z.string(),
    object: z.literal('event'),
    type: z.string(),
    data: z.object({
      object: z.any(),
    }),
  }),
});
