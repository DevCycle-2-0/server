import { Router } from 'express';
import { BillingController } from '../controllers/BillingController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const billingController = new BillingController();

router.use(authenticate);

router.get(
  '/:workspaceId/billing/subscription',
  billingController.getSubscription
);
router.post(
  '/:workspaceId/billing/subscription',
  billingController.createSubscription
);
router.patch(
  '/:workspaceId/billing/subscription',
  billingController.updateSubscription
);
router.delete(
  '/:workspaceId/billing/subscription',
  billingController.cancelSubscription
);
router.get('/:workspaceId/billing/plans', billingController.listPlans);
router.get('/:workspaceId/billing/invoices', billingController.listInvoices);
router.get('/:workspaceId/billing/usage', billingController.getUsage);

export default router;
