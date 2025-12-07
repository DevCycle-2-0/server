import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  Subscription,
  BillingInterval,
  SubscriptionStatus,
} from '@core/domain/entities/Subscription';
import { PaymentMethod } from '@core/domain/entities/PaymentMethod';
import { Invoice, InvoiceStatus } from '@core/domain/entities/Invoice';
import { SubscriptionModel } from '@infrastructure/database/models/SubscriptionModel';
import { PaymentMethodModel } from '@infrastructure/database/models/PaymentMethodModel';
import { InvoiceModel } from '@infrastructure/database/models/InvoiceModel';
import { PLANS, getPlan, getStripePriceId } from '@config/plans.config';

// Mock Stripe service (replace with actual Stripe integration)
class MockStripeService {
  async createCustomer(email: string, name: string) {
    return { id: `cus_${crypto.randomUUID().slice(0, 14)}` };
  }

  async createSubscription(customerId: string, priceId: string) {
    return {
      id: `sub_${crypto.randomUUID().slice(0, 14)}`,
      current_period_start: Date.now() / 1000,
      current_period_end: Date.now() / 1000 + 30 * 24 * 60 * 60,
    };
  }

  async updateSubscription(subscriptionId: string, priceId: string) {
    return { id: subscriptionId };
  }

  async cancelSubscription(subscriptionId: string) {
    return { id: subscriptionId, status: 'canceled' };
  }

  async createPaymentMethod(data: any) {
    return { id: `pm_${crypto.randomUUID().slice(0, 14)}` };
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    return { id: paymentMethodId };
  }

  async detachPaymentMethod(paymentMethodId: string) {
    return { id: paymentMethodId };
  }
}

export class BillingController {
  private stripeService: MockStripeService;

  constructor() {
    this.stripeService = new MockStripeService();
  }

  /**
   * GET /billing/plans
   * Get all available plans
   */
  getPlans = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plans = Object.values(PLANS).map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        features: plan.features,
        limits: plan.limits,
        popular: plan.popular,
      }));

      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /billing/plans/:id
   * Get plan by ID
   */
  getPlan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const plan = getPlan(id);

      if (!plan) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Plan not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          limits: plan.limits,
          popular: plan.popular,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /billing/subscription
   * Get current subscription
   */
  getSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;

      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No subscription found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: subscription.id,
          userId: subscription.user_id,
          workspaceId: subscription.workspace_id,
          planId: subscription.plan_id,
          status: subscription.status,
          interval: subscription.interval,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEndsAt: subscription.trial_ends_at,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /billing/checkout
   * Create checkout session and subscription
   */
  createCheckout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const workspaceId = req.user!.workspaceId;
      const { planId, interval } = req.body;

      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to workspace' },
        });
        return;
      }

      // Validate plan
      const plan = getPlan(planId);
      if (!plan) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PLAN', message: 'Invalid plan ID' },
        });
        return;
      }

      // Check if user already has subscription
      const existing = await SubscriptionModel.findOne({
        where: { user_id: userId, workspace_id: workspaceId },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          error: { code: 'SUBSCRIPTION_EXISTS', message: 'Subscription already exists' },
        });
        return;
      }

      // Create Stripe customer and subscription
      const customer = await this.stripeService.createCustomer(req.user!.email, req.user!.email);

      const priceId = getStripePriceId(planId, interval);
      const stripeSubscription = priceId
        ? await this.stripeService.createSubscription(customer.id, priceId)
        : null;

      // Create subscription
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (interval === 'yearly' ? 365 : 30));

      const subscription = await SubscriptionModel.create({
        user_id: userId,
        workspace_id: workspaceId,
        plan_id: planId,
        status: 'active',
        interval,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: false,
        stripe_subscription_id: stripeSubscription?.id,
        stripe_customer_id: customer.id,
      });

      res.status(201).json({
        success: true,
        data: {
          id: subscription.id,
          userId: subscription.user_id,
          workspaceId: subscription.workspace_id,
          planId: subscription.plan_id,
          status: subscription.status,
          interval: subscription.interval,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /billing/subscription
   * Update subscription (change plan/interval)
   */
  updateSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { planId, interval } = req.body;

      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Subscription not found' },
        });
        return;
      }

      // Validate new plan
      const plan = getPlan(planId);
      if (!plan) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PLAN', message: 'Invalid plan ID' },
        });
        return;
      }

      // Update Stripe subscription if exists
      if (subscription.stripe_subscription_id) {
        const priceId = getStripePriceId(planId, interval);
        if (priceId) {
          await this.stripeService.updateSubscription(subscription.stripe_subscription_id, priceId);
        }
      }

      // Update subscription
      subscription.plan_id = planId;
      subscription.interval = interval;
      await subscription.save();

      res.json({
        success: true,
        data: {
          id: subscription.id,
          planId: subscription.plan_id,
          interval: subscription.interval,
          status: subscription.status,
        },
        message: 'Subscription updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /billing/subscription/cancel
   * Cancel subscription at period end
   */
  cancelSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;

      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Subscription not found' },
        });
        return;
      }

      if (subscription.status === 'canceled') {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_CANCELED', message: 'Subscription already canceled' },
        });
        return;
      }

      // Cancel Stripe subscription
      if (subscription.stripe_subscription_id) {
        await this.stripeService.cancelSubscription(subscription.stripe_subscription_id);
      }

      subscription.cancel_at_period_end = true;
      await subscription.save();

      res.json({
        success: true,
        message: 'Subscription will be canceled at period end',
        data: {
          cancelAtPeriodEnd: true,
          currentPeriodEnd: subscription.current_period_end,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /billing/usage
   * Get current usage metrics
   */
  getUsage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;

      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to workspace' },
        });
        return;
      }

      // Get actual usage from database
      const { ProductModel } = await import('@infrastructure/database/models/ProductModel');
      const { UserRoleModel } = await import('@infrastructure/database/models/UserRoleModel');
      const { FeatureModel } = await import('@infrastructure/database/models/FeatureModel');

      const [products, teamMembers, features] = await Promise.all([
        ProductModel.count({ where: { workspace_id: workspaceId } }),
        UserRoleModel.count({ where: { workspace_id: workspaceId } }),
        FeatureModel.count({
          where: { workspace_id: workspaceId },
          // Count features created this month
        }),
      ]);

      res.json({
        success: true,
        data: {
          products,
          teamMembers,
          features,
          storage: 50, // Mock - would calculate actual storage
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /billing/invoices
   * Get all invoices
   */
  getInvoices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;

      // Get user's subscription
      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      if (!subscription) {
        res.json({
          success: true,
          data: [],
        });
        return;
      }

      // Get invoices
      const invoices = await InvoiceModel.findAll({
        where: { subscription_id: subscription.id },
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: invoices.map((inv) => ({
          id: inv.id,
          subscriptionId: inv.subscription_id,
          amount: inv.amount,
          currency: inv.currency,
          status: inv.status,
          createdAt: inv.created_at,
          paidAt: inv.paid_at,
          invoiceUrl: inv.invoice_url,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /billing/invoices/:id
   * Get invoice by ID
   */
  getInvoice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const invoice = await InvoiceModel.findOne({
        where: { id },
        include: [
          {
            model: SubscriptionModel,
            as: 'subscription',
            where: { user_id: userId },
            required: true,
          },
        ],
      });

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: invoice.id,
          subscriptionId: invoice.subscription_id,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          createdAt: invoice.created_at,
          paidAt: invoice.paid_at,
          invoiceUrl: invoice.invoice_url,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /billing/invoices/:id/pdf
   * Download invoice PDF
   */
  downloadInvoicePdf = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const invoice = await InvoiceModel.findOne({
        where: { id },
        include: [
          {
            model: SubscriptionModel,
            as: 'subscription',
            where: { user_id: userId },
            required: true,
          },
        ],
      });

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' },
        });
        return;
      }

      if (!invoice.invoice_pdf) {
        res.status(404).json({
          success: false,
          error: { code: 'PDF_NOT_AVAILABLE', message: 'PDF not available' },
        });
        return;
      }

      // In production, stream PDF from S3 or Stripe
      res.redirect(invoice.invoice_pdf);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /billing/payment-methods
   * Get all payment methods
   */
  getPaymentMethods = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;

      const paymentMethods = await PaymentMethodModel.findAll({
        where: { user_id: userId },
        order: [
          ['is_default', 'DESC'],
          ['created_at', 'DESC'],
        ],
      });

      res.json({
        success: true,
        data: paymentMethods.map((pm) => ({
          id: pm.id,
          type: pm.type,
          brand: pm.brand,
          last4: pm.last4,
          expiryMonth: pm.expiry_month,
          expiryYear: pm.expiry_year,
          isDefault: pm.is_default,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /billing/payment-methods
   * Add payment method
   */
  addPaymentMethod = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { type, brand, last4, expiryMonth, expiryYear, isDefault } = req.body;

      // Get user's Stripe customer ID
      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      let stripePaymentMethodId: string | undefined;

      if (subscription?.stripe_customer_id) {
        // Create Stripe payment method
        const stripePaymentMethod = await this.stripeService.createPaymentMethod({
          type,
          card: { brand, last4, exp_month: expiryMonth, exp_year: expiryYear },
        });

        await this.stripeService.attachPaymentMethod(
          stripePaymentMethod.id,
          subscription.stripe_customer_id
        );

        stripePaymentMethodId = stripePaymentMethod.id;
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await PaymentMethodModel.update({ is_default: false }, { where: { user_id: userId } });
      }

      // Create payment method
      const paymentMethod = await PaymentMethodModel.create({
        user_id: userId,
        type,
        brand,
        last4,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        is_default: isDefault || false,
        stripe_payment_method_id: stripePaymentMethodId,
      });

      res.status(201).json({
        success: true,
        data: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          brand: paymentMethod.brand,
          last4: paymentMethod.last4,
          expiryMonth: paymentMethod.expiry_month,
          expiryYear: paymentMethod.expiry_year,
          isDefault: paymentMethod.is_default,
        },
        message: 'Payment method added successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /billing/payment-methods/:id
   * Remove payment method
   */
  removePaymentMethod = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const paymentMethod = await PaymentMethodModel.findOne({
        where: { id, user_id: userId },
      });

      if (!paymentMethod) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Payment method not found' },
        });
        return;
      }

      // Detach from Stripe
      if (paymentMethod.stripe_payment_method_id) {
        await this.stripeService.detachPaymentMethod(paymentMethod.stripe_payment_method_id);
      }

      await paymentMethod.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
