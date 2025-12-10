import { Router } from "express";
import { BillingController } from "../controllers/BillingController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  createSubscriptionValidator,
  updateSubscriptionValidator,
  addPaymentMethodValidator,
  invoiceIdValidator,
  paymentMethodIdValidator,
} from "@modules/billing/infrastructure/validators/BillingValidators";

const router = Router();
const billingController = new BillingController();

// Public route - get available plans
router.get("/plans", billingController.getPlans);

// All other billing routes require authentication
router.use(authenticate);

// Subscription routes
router.get("/subscription", billingController.getSubscription);
router.post(
  "/subscription",
  createSubscriptionValidator,
  validateRequest,
  billingController.createSubscription
);
router.patch(
  "/subscription",
  updateSubscriptionValidator,
  validateRequest,
  billingController.updateSubscription
);
router.delete("/subscription", billingController.cancelSubscription);

// Usage route
router.get("/usage", billingController.getUsage);

// Invoice routes
router.get("/invoices", billingController.getInvoices);
router.get(
  "/invoices/:id",
  invoiceIdValidator,
  validateRequest,
  billingController.getInvoiceById
);

// Payment method routes
router.get("/payment-methods", billingController.getPaymentMethods);
router.post(
  "/payment-methods",
  addPaymentMethodValidator,
  validateRequest,
  billingController.addPaymentMethod
);
router.delete(
  "/payment-methods/:id",
  paymentMethodIdValidator,
  validateRequest,
  billingController.deletePaymentMethod
);
router.post(
  "/payment-methods/:id/default",
  paymentMethodIdValidator,
  validateRequest,
  billingController.setDefaultPaymentMethod
);

export default router;
