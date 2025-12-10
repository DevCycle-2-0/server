import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  GetPlansUseCase,
  GetSubscriptionUseCase,
  CreateSubscriptionUseCase,
  UpdateSubscriptionUseCase,
  CancelSubscriptionUseCase,
  GetUsageUseCase,
  GetInvoicesUseCase,
  GetInvoiceByIdUseCase,
  GetPaymentMethodsUseCase,
  AddPaymentMethodUseCase,
  DeletePaymentMethodUseCase,
  SetDefaultPaymentMethodUseCase,
} from "@modules/billing/application/use-cases/BillingUseCases";
import { SubscriptionRepository } from "@modules/billing/infrastructure/persistence/repositories/SubscriptionRepository";
import { PaymentMethodRepository } from "@modules/billing/infrastructure/persistence/repositories/PaymentMethodRepository";
import { InvoiceRepository } from "@modules/billing/infrastructure/persistence/repositories/InvoiceRepository";
import { ProductRepository } from "@modules/products/infrastructure/persistence/repositories/ProductRepository";
import { TeamRepository } from "@modules/team/infrastructure/persistence/repositories/TeamRepository";
import { FeatureRepository } from "@modules/features/infrastructure/persistence/repositories/FeatureRepository";

export class BillingController {
  private getPlansUseCase: GetPlansUseCase;
  private getSubscriptionUseCase: GetSubscriptionUseCase;
  private createSubscriptionUseCase: CreateSubscriptionUseCase;
  private updateSubscriptionUseCase: UpdateSubscriptionUseCase;
  private cancelSubscriptionUseCase: CancelSubscriptionUseCase;
  private getUsageUseCase: GetUsageUseCase;
  private getInvoicesUseCase: GetInvoicesUseCase;
  private getInvoiceByIdUseCase: GetInvoiceByIdUseCase;
  private getPaymentMethodsUseCase: GetPaymentMethodsUseCase;
  private addPaymentMethodUseCase: AddPaymentMethodUseCase;
  private deletePaymentMethodUseCase: DeletePaymentMethodUseCase;
  private setDefaultPaymentMethodUseCase: SetDefaultPaymentMethodUseCase;

  constructor() {
    const subscriptionRepository = new SubscriptionRepository();
    const paymentMethodRepository = new PaymentMethodRepository();
    const invoiceRepository = new InvoiceRepository();
    const productRepository = new ProductRepository();
    const teamRepository = new TeamRepository();
    const featureRepository = new FeatureRepository();

    this.getPlansUseCase = new GetPlansUseCase();
    this.getSubscriptionUseCase = new GetSubscriptionUseCase(
      subscriptionRepository
    );
    this.createSubscriptionUseCase = new CreateSubscriptionUseCase(
      subscriptionRepository
    );
    this.updateSubscriptionUseCase = new UpdateSubscriptionUseCase(
      subscriptionRepository
    );
    this.cancelSubscriptionUseCase = new CancelSubscriptionUseCase(
      subscriptionRepository
    );
    this.getUsageUseCase = new GetUsageUseCase(
      productRepository,
      teamRepository,
      featureRepository
    );
    this.getInvoicesUseCase = new GetInvoicesUseCase(
      invoiceRepository,
      subscriptionRepository
    );
    this.getInvoiceByIdUseCase = new GetInvoiceByIdUseCase(invoiceRepository);
    this.getPaymentMethodsUseCase = new GetPaymentMethodsUseCase(
      paymentMethodRepository
    );
    this.addPaymentMethodUseCase = new AddPaymentMethodUseCase(
      paymentMethodRepository
    );
    this.deletePaymentMethodUseCase = new DeletePaymentMethodUseCase(
      paymentMethodRepository
    );
    this.setDefaultPaymentMethodUseCase = new SetDefaultPaymentMethodUseCase(
      paymentMethodRepository
    );
  }

  getPlans = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const result = await this.getPlansUseCase.execute();

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get plans error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSubscriptionUseCase.execute(req.user.userId);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get subscription error:", error);
      return ApiResponse.internalError(res);
    }
  };

  createSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.createSubscriptionUseCase.execute({
        userId: req.user.userId,
        workspaceId: req.user.workspaceId,
        data: req.body,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Create subscription error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateSubscriptionUseCase.execute({
        userId: req.user.userId,
        data: req.body,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update subscription error:", error);
      return ApiResponse.internalError(res);
    }
  };

  cancelSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.cancelSubscriptionUseCase.execute(
        req.user.userId
      );

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getUsage = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getUsageUseCase.execute({
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get usage error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getInvoices = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getInvoicesUseCase.execute(req.user.userId);

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get invoices error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getInvoiceById = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getInvoiceByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get invoice by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getPaymentMethods = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getPaymentMethodsUseCase.execute(
        req.user.userId
      );

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get payment methods error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addPaymentMethod = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.addPaymentMethodUseCase.execute({
        userId: req.user.userId,
        data: req.body,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Add payment method error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deletePaymentMethod = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.deletePaymentMethodUseCase.execute(
        req.params.id
      );

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete payment method error:", error);
      return ApiResponse.internalError(res);
    }
  };

  setDefaultPaymentMethod = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.setDefaultPaymentMethodUseCase.execute({
        userId: req.user.userId,
        paymentMethodId: req.params.id,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Set default payment method error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
