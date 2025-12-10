import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ISubscriptionRepository } from "@modules/billing/domain/repositories/ISubscriptionRepository";
import { IPaymentMethodRepository } from "@modules/billing/domain/repositories/IPaymentMethodRepository";
import { IInvoiceRepository } from "@modules/billing/domain/repositories/IInvoiceRepository";
import {
  Subscription,
  PlanId,
  BillingInterval,
} from "@modules/billing/domain/entities/Subscription";
import { PaymentMethod } from "@modules/billing/domain/entities/PaymentMethod";
import { Invoice } from "@modules/billing/domain/entities/Invoice";
import { PlanService } from "@modules/billing/domain/services/PlanService";
import {
  Plan,
  SubscriptionDto,
  UsageDto,
  InvoiceDto,
  PaymentMethodDto,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  AddPaymentMethodRequest,
} from "../dtos/BillingDtos";

// Get All Plans
export class GetPlansUseCase implements UseCase<void, Result<Plan[]>> {
  async execute(): Promise<Result<Plan[]>> {
    const plans = PlanService.getAllPlans();
    return Result.ok<Plan[]>(plans);
  }
}

// Get Current Subscription
export class GetSubscriptionUseCase
  implements UseCase<string, Result<SubscriptionDto>>
{
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(userId: string): Promise<Result<SubscriptionDto>> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      return Result.fail<SubscriptionDto>("No subscription found");
    }

    const dto: SubscriptionDto = {
      id: subscription.id,
      userId: subscription.userId,
      workspaceId: subscription.workspaceId,
      planId: subscription.planId,
      status: subscription.status,
      interval: subscription.interval,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialEndsAt: subscription.trialEndsAt?.toISOString(),
    };

    return Result.ok<SubscriptionDto>(dto);
  }
}

// Create/Upgrade Subscription
interface CreateSubscriptionInput {
  userId: string;
  workspaceId: string;
  data: CreateSubscriptionRequest;
}

export class CreateSubscriptionUseCase
  implements UseCase<CreateSubscriptionInput, Result<SubscriptionDto>>
{
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(
    input: CreateSubscriptionInput
  ): Promise<Result<SubscriptionDto>> {
    // Check if plan exists
    const plan = PlanService.getPlanById(input.data.planId);
    if (!plan) {
      return Result.fail<SubscriptionDto>("Invalid plan");
    }

    // Check if user already has a subscription
    const existing = await this.subscriptionRepository.findByUserId(
      input.userId
    );
    if (existing) {
      return Result.fail<SubscriptionDto>(
        "User already has a subscription. Use update endpoint."
      );
    }

    // Create subscription (with 14-day trial for paid plans)
    const trialDays = input.data.planId !== "free" ? 14 : 0;
    const subscription = Subscription.create({
      userId: input.userId,
      workspaceId: input.workspaceId,
      planId: input.data.planId,
      interval: input.data.interval,
      trialDays,
    });

    const saved = await this.subscriptionRepository.save(subscription);

    const dto: SubscriptionDto = {
      id: saved.id,
      userId: saved.userId,
      workspaceId: saved.workspaceId,
      planId: saved.planId,
      status: saved.status,
      interval: saved.interval,
      currentPeriodStart: saved.currentPeriodStart.toISOString(),
      currentPeriodEnd: saved.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: saved.cancelAtPeriodEnd,
      trialEndsAt: saved.trialEndsAt?.toISOString(),
    };

    return Result.ok<SubscriptionDto>(dto);
  }
}

// Update Subscription
interface UpdateSubscriptionInput {
  userId: string;
  data: UpdateSubscriptionRequest;
}

export class UpdateSubscriptionUseCase
  implements UseCase<UpdateSubscriptionInput, Result<SubscriptionDto>>
{
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(
    input: UpdateSubscriptionInput
  ): Promise<Result<SubscriptionDto>> {
    const subscription = await this.subscriptionRepository.findByUserId(
      input.userId
    );

    if (!subscription) {
      return Result.fail<SubscriptionDto>("No subscription found");
    }

    // Check if plan exists
    const plan = PlanService.getPlanById(input.data.planId);
    if (!plan) {
      return Result.fail<SubscriptionDto>("Invalid plan");
    }

    // Update plan
    try {
      subscription.changePlan(input.data.planId);
      const updated = await this.subscriptionRepository.save(subscription);

      const dto: SubscriptionDto = {
        id: updated.id,
        userId: updated.userId,
        workspaceId: updated.workspaceId,
        planId: updated.planId,
        status: updated.status,
        interval: updated.interval,
        currentPeriodStart: updated.currentPeriodStart.toISOString(),
        currentPeriodEnd: updated.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
        trialEndsAt: updated.trialEndsAt?.toISOString(),
      };

      return Result.ok<SubscriptionDto>(dto);
    } catch (error: any) {
      return Result.fail<SubscriptionDto>(error.message);
    }
  }
}

// Cancel Subscription
export class CancelSubscriptionUseCase
  implements UseCase<string, Result<{ message: string }>>
{
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(userId: string): Promise<Result<{ message: string }>> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      return Result.fail<{ message: string }>("No subscription found");
    }

    try {
      subscription.cancel();
      await this.subscriptionRepository.save(subscription);

      return Result.ok<{ message: string }>({
        message: "Subscription will be cancelled at period end",
      });
    } catch (error: any) {
      return Result.fail<{ message: string }>(error.message);
    }
  }
}

// Get Usage
interface GetUsageInput {
  workspaceId: string;
}

export class GetUsageUseCase
  implements UseCase<GetUsageInput, Result<UsageDto>>
{
  constructor(
    private productRepository: any,
    private teamRepository: any,
    private featureRepository: any
  ) {}

  async execute(input: GetUsageInput): Promise<Result<UsageDto>> {
    // Get product count
    const { products } = await this.productRepository.findAll(
      { workspaceId: input.workspaceId, status: "active" },
      {},
      1,
      1000
    );

    // Get team member count
    const teamMembers = await this.teamRepository.findAll({
      workspaceId: input.workspaceId,
      status: "active",
    });

    // Get features created this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { features } = await this.featureRepository.findAll(
      { workspaceId: input.workspaceId },
      {},
      1,
      10000
    );
    const featuresThisMonth = features.filter(
      (f: any) => f.createdAt >= firstDayOfMonth
    ).length;

    // Storage would need to be calculated from attachments/files
    const storage = 0;

    const usage: UsageDto = {
      products: products.length,
      teamMembers: teamMembers.length,
      features: featuresThisMonth,
      storage,
    };

    return Result.ok<UsageDto>(usage);
  }
}

// Get Invoices
export class GetInvoicesUseCase
  implements UseCase<string, Result<InvoiceDto[]>>
{
  constructor(
    private invoiceRepository: IInvoiceRepository,
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(userId: string): Promise<Result<InvoiceDto[]>> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      return Result.ok<InvoiceDto[]>([]);
    }

    const invoices = await this.invoiceRepository.findBySubscriptionId(
      subscription.id
    );

    const dtos: InvoiceDto[] = invoices.map((invoice) => ({
      id: invoice.id,
      subscriptionId: invoice.subscriptionId,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      invoiceUrl: invoice.invoiceUrl,
    }));

    return Result.ok<InvoiceDto[]>(dtos);
  }
}

// Get Invoice by ID
export class GetInvoiceByIdUseCase
  implements UseCase<string, Result<InvoiceDto>>
{
  constructor(private invoiceRepository: IInvoiceRepository) {}

  async execute(invoiceId: string): Promise<Result<InvoiceDto>> {
    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice) {
      return Result.fail<InvoiceDto>("Invoice not found");
    }

    const dto: InvoiceDto = {
      id: invoice.id,
      subscriptionId: invoice.subscriptionId,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      invoiceUrl: invoice.invoiceUrl,
    };

    return Result.ok<InvoiceDto>(dto);
  }
}

// Get Payment Methods
export class GetPaymentMethodsUseCase
  implements UseCase<string, Result<PaymentMethodDto[]>>
{
  constructor(private paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(userId: string): Promise<Result<PaymentMethodDto[]>> {
    const paymentMethods = await this.paymentMethodRepository.findByUserId(
      userId
    );

    const dtos: PaymentMethodDto[] = paymentMethods.map((pm) => ({
      id: pm.id,
      type: pm.type,
      last4: pm.last4,
      brand: pm.brand,
      expiryMonth: pm.expiryMonth,
      expiryYear: pm.expiryYear,
      isDefault: pm.isDefault,
    }));

    return Result.ok<PaymentMethodDto[]>(dtos);
  }
}

// Add Payment Method
interface AddPaymentMethodInput {
  userId: string;
  data: AddPaymentMethodRequest;
}

export class AddPaymentMethodUseCase
  implements UseCase<AddPaymentMethodInput, Result<PaymentMethodDto>>
{
  constructor(private paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(
    input: AddPaymentMethodInput
  ): Promise<Result<PaymentMethodDto>> {
    // In production, you would:
    // 1. Validate the token with Stripe
    // 2. Create a payment method in Stripe
    // 3. Store the Stripe payment method ID

    // For demo purposes, create a mock payment method
    const existingMethods = await this.paymentMethodRepository.findByUserId(
      input.userId
    );

    const paymentMethod = PaymentMethod.create({
      userId: input.userId,
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: existingMethods.length === 0,
      stripePaymentMethodId: input.data.token,
    });

    const saved = await this.paymentMethodRepository.save(paymentMethod);

    const dto: PaymentMethodDto = {
      id: saved.id,
      type: saved.type,
      last4: saved.last4,
      brand: saved.brand,
      expiryMonth: saved.expiryMonth,
      expiryYear: saved.expiryYear,
      isDefault: saved.isDefault,
    };

    return Result.ok<PaymentMethodDto>(dto);
  }
}

// Delete Payment Method
export class DeletePaymentMethodUseCase
  implements UseCase<string, Result<void>>
{
  constructor(private paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(paymentMethodId: string): Promise<Result<void>> {
    const paymentMethod = await this.paymentMethodRepository.findById(
      paymentMethodId
    );

    if (!paymentMethod) {
      return Result.fail<void>("Payment method not found");
    }

    if (paymentMethod.isDefault) {
      return Result.fail<void>("Cannot delete default payment method");
    }

    await this.paymentMethodRepository.delete(paymentMethodId);
    return Result.ok<void>();
  }
}

// Set Default Payment Method
export class SetDefaultPaymentMethodUseCase
  implements
    UseCase<
      { userId: string; paymentMethodId: string },
      Result<PaymentMethodDto>
    >
{
  constructor(private paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(input: {
    userId: string;
    paymentMethodId: string;
  }): Promise<Result<PaymentMethodDto>> {
    const paymentMethod = await this.paymentMethodRepository.findById(
      input.paymentMethodId
    );

    if (!paymentMethod) {
      return Result.fail<PaymentMethodDto>("Payment method not found");
    }

    if (paymentMethod.userId !== input.userId) {
      return Result.fail<PaymentMethodDto>("Payment method not found");
    }

    // Unset current default
    const currentDefault =
      await this.paymentMethodRepository.findDefaultByUserId(input.userId);
    if (currentDefault) {
      currentDefault.unsetAsDefault();
      await this.paymentMethodRepository.save(currentDefault);
    }

    // Set new default
    paymentMethod.setAsDefault();
    const updated = await this.paymentMethodRepository.save(paymentMethod);

    const dto: PaymentMethodDto = {
      id: updated.id,
      type: updated.type,
      last4: updated.last4,
      brand: updated.brand,
      expiryMonth: updated.expiryMonth,
      expiryYear: updated.expiryYear,
      isDefault: updated.isDefault,
    };

    return Result.ok<PaymentMethodDto>(dto);
  }
}
