import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { WorkspaceModel } from '@infrastructure/database/models/WorkspaceModel';
import { successResponse } from '@shared/utils/response';
import { NotFoundError } from '@shared/errors/AppError';
import { SubscriptionPlan } from '@shared/types';

export class BillingController {
  getSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { workspaceId } = req.params;

      const workspace = await WorkspaceModel.findByPk(workspaceId);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      res.json(
        successResponse({
          id: workspace.stripeSubscriptionId || 'sub_free',
          plan: {
            id: workspace.subscriptionPlan,
            name:
              workspace.subscriptionPlan.charAt(0).toUpperCase() +
              workspace.subscriptionPlan.slice(1),
            price_monthly: this.getPlanPrice(
              workspace.subscriptionPlan,
              'monthly'
            ),
            price_yearly: this.getPlanPrice(
              workspace.subscriptionPlan,
              'yearly'
            ),
            currency: 'usd',
          },
          status: workspace.subscriptionStatus,
          billing_cycle: 'monthly',
          current_period: {
            start: new Date().toISOString().split('T')[0],
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          },
          seats: {
            included: this.getPlanSeats(workspace.subscriptionPlan),
            used: 1,
            additional_price: 1000,
          },
          features: {
            products_limit: this.getPlanLimit(
              workspace.subscriptionPlan,
              'products'
            ),
            products_used: 0,
            storage_gb_limit: this.getPlanLimit(
              workspace.subscriptionPlan,
              'storage'
            ),
            storage_gb_used: 0,
            api_calls_limit: this.getPlanLimit(
              workspace.subscriptionPlan,
              'api_calls'
            ),
            api_calls_used: 0,
          },
          payment_method: null,
          next_invoice: null,
          created_at: workspace.createdAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  createSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { workspaceId } = req.params;
      const { plan_id, billing_cycle, payment_method_id, seats } = req.body;

      const workspace = await WorkspaceModel.findByPk(workspaceId);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      workspace.subscriptionPlan = plan_id as SubscriptionPlan;
      workspace.subscriptionStatus = 'active';
      await workspace.save();

      res.status(201).json(
        successResponse({
          id: 'sub_' + Date.now(),
          plan: {
            id: plan_id,
            name: plan_id.charAt(0).toUpperCase() + plan_id.slice(1),
          },
          status: 'active',
          billing_cycle,
          amount: this.getPlanPrice(plan_id, billing_cycle),
          currency: 'usd',
          current_period: {
            start: new Date().toISOString().split('T')[0],
            end:
              billing_cycle === 'yearly'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
          },
          created_at: new Date(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { workspaceId } = req.params;
      const { plan_id, seats } = req.body;

      const workspace = await WorkspaceModel.findByPk(workspaceId);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      const previousPlan = workspace.subscriptionPlan;
      workspace.subscriptionPlan = plan_id as SubscriptionPlan;
      await workspace.save();

      res.json(
        successResponse({
          id: workspace.stripeSubscriptionId || 'sub_' + Date.now(),
          previous_plan: previousPlan,
          new_plan: plan_id,
          proration: {
            amount: 0,
            description: 'Upgrade applied immediately',
          },
          effective_date: new Date().toISOString().split('T')[0],
          updated_at: workspace.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  cancelSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { workspaceId } = req.params;
      const { reason, feedback, cancel_at_period_end } = req.body;

      const workspace = await WorkspaceModel.findByPk(workspaceId);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      if (cancel_at_period_end) {
        workspace.subscriptionStatus = 'canceling';
      } else {
        workspace.subscriptionPlan = SubscriptionPlan.FREE;
        workspace.subscriptionStatus = 'canceled';
      }
      await workspace.save();

      res.json(
        successResponse({
          id: workspace.stripeSubscriptionId || 'sub_canceled',
          status: workspace.subscriptionStatus,
          cancel_at_period_end,
          cancels_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          access_until: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listPlans = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(
        successResponse([
          {
            id: 'free',
            name: 'Free',
            description: 'For individuals and small teams getting started',
            price_monthly: 0,
            price_yearly: 0,
            currency: 'usd',
            features: {
              seats: 3,
              products: 1,
              features_per_product: 10,
              storage_gb: 1,
              api_calls: 1000,
              support: 'community',
              integrations: false,
              analytics: 'basic',
              custom_fields: false,
              audit_logs: false,
            },
            popular: false,
          },
          {
            id: 'starter',
            name: 'Starter',
            description: 'For growing teams with basic needs',
            price_monthly: 1500,
            price_yearly: 15000,
            currency: 'usd',
            features: {
              seats: 5,
              products: 5,
              features_per_product: 50,
              storage_gb: 10,
              api_calls: 10000,
              support: 'email',
              integrations: true,
              analytics: 'standard',
              custom_fields: true,
              audit_logs: false,
            },
            popular: false,
          },
          {
            id: 'professional',
            name: 'Professional',
            description: 'For professional teams that need more power',
            price_monthly: 2900,
            price_yearly: 29000,
            currency: 'usd',
            features: {
              seats: 10,
              products: 25,
              features_per_product: 'unlimited',
              storage_gb: 50,
              api_calls: 100000,
              support: 'priority',
              integrations: true,
              analytics: 'advanced',
              custom_fields: true,
              audit_logs: true,
            },
            popular: true,
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For large organizations with advanced needs',
            price_monthly: null,
            price_yearly: null,
            currency: 'usd',
            contact_sales: true,
            features: {
              seats: 'unlimited',
              products: 'unlimited',
              features_per_product: 'unlimited',
              storage_gb: 'unlimited',
              api_calls: 'unlimited',
              support: 'dedicated',
              integrations: true,
              analytics: 'enterprise',
              custom_fields: true,
              audit_logs: true,
              sso: true,
              custom_contracts: true,
              sla: '99.9%',
            },
            popular: false,
          },
        ])
      );
    } catch (error) {
      next(error);
    }
  };

  listInvoices = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder for invoice history
      res.json(
        successResponse([], { page: 1, limit: 20, total: 0, total_pages: 0 })
      );
    } catch (error) {
      next(error);
    }
  };

  getUsage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;

      const workspace = await WorkspaceModel.findByPk(workspaceId);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      res.json(
        successResponse({
          period: {
            start: new Date().toISOString().split('T')[0],
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          },
          seats: {
            included: this.getPlanSeats(workspace.subscriptionPlan),
            used: 1,
            available: this.getPlanSeats(workspace.subscriptionPlan) - 1,
          },
          products: {
            limit: this.getPlanLimit(workspace.subscriptionPlan, 'products'),
            used: 0,
            available: this.getPlanLimit(
              workspace.subscriptionPlan,
              'products'
            ),
          },
          storage: {
            limit_gb: this.getPlanLimit(workspace.subscriptionPlan, 'storage'),
            used_gb: 0,
            available_gb: this.getPlanLimit(
              workspace.subscriptionPlan,
              'storage'
            ),
            usage_percentage: 0,
          },
          api_calls: {
            limit: this.getPlanLimit(workspace.subscriptionPlan, 'api_calls'),
            used: 0,
            available: this.getPlanLimit(
              workspace.subscriptionPlan,
              'api_calls'
            ),
            usage_percentage: 0,
          },
          features: {
            total: 0,
            limit: null,
          },
          history: {
            api_calls: [],
            storage: [],
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // Helper methods
  private getPlanPrice(plan: string, cycle: string): number {
    const prices: any = {
      free: { monthly: 0, yearly: 0 },
      starter: { monthly: 1500, yearly: 15000 },
      professional: { monthly: 2900, yearly: 29000 },
      enterprise: { monthly: null, yearly: null },
    };
    return prices[plan]?.[cycle] || 0;
  }

  private getPlanSeats(plan: string): number {
    const seats: any = {
      free: 3,
      starter: 5,
      professional: 10,
      enterprise: 999,
    };
    return seats[plan] || 3;
  }

  private getPlanLimit(plan: string, resource: string): number {
    const limits: any = {
      free: { products: 1, storage: 1, api_calls: 1000 },
      starter: { products: 5, storage: 10, api_calls: 10000 },
      professional: { products: 25, storage: 50, api_calls: 100000 },
      enterprise: { products: 999, storage: 999, api_calls: 999999 },
    };
    return limits[plan]?.[resource] || 0;
  }
}
