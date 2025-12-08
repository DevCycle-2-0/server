import { Router } from 'express';
import { BillingController } from '../controllers/BillingController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  cancelSubscriptionSchema,
  addPaymentMethodSchema,
} from '@application/validators/BillingValidator';

const router = Router();
const billingController = new BillingController();

router.use(authenticate);

router.get(
  '/:workspaceId/billing/subscription',
  billingController.getSubscription
);
router.post(
  '/:workspaceId/billing/subscription',
  validate(createSubscriptionSchema),
  billingController.createSubscription
);
router.patch(
  '/:workspaceId/billing/subscription',
  validate(updateSubscriptionSchema),
  billingController.updateSubscription
);
router.delete(
  '/:workspaceId/billing/subscription',
  validate(cancelSubscriptionSchema),
  billingController.cancelSubscription
);
router.get('/:workspaceId/billing/plans', billingController.listPlans);
router.get('/:workspaceId/billing/invoices', billingController.listInvoices);
router.get('/:workspaceId/billing/usage', billingController.getUsage);
router.post(
  '/:workspaceId/billing/payment-methods',
  validate(addPaymentMethodSchema),
  billingController.listPlans
);

export default router;
