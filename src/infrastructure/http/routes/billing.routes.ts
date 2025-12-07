import { Router } from 'express';
import { BillingController } from '../controllers/BillingController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCheckoutSchema,
  updateSubscriptionSchema,
  addPaymentMethodSchema,
} from '../validators/billing.validator';

const router = Router();
const billingController = new BillingController();

/**
 * PUBLIC ROUTES
 */

/**
 * @route   GET /api/v1/billing/plans
 * @desc    Get all available subscription plans
 * @access  Public
 */
router.get('/plans', billingController.getPlans);

/**
 * @route   GET /api/v1/billing/plans/:id
 * @desc    Get plan details by ID
 * @access  Public
 */
router.get('/plans/:id', billingController.getPlan);

/**
 * AUTHENTICATED ROUTES
 */
router.use(authenticate);

/**
 * @route   GET /api/v1/billing/subscription
 * @desc    Get current subscription
 * @access  Private
 */
router.get('/subscription', billingController.getSubscription);

/**
 * @route   POST /api/v1/billing/checkout
 * @desc    Create checkout session and subscription
 * @access  Private
 */
router.post('/checkout', validate(createCheckoutSchema), billingController.createCheckout);

/**
 * @route   PATCH /api/v1/billing/subscription
 * @desc    Update subscription (change plan or interval)
 * @access  Private
 */
router.patch(
  '/subscription',
  validate(updateSubscriptionSchema),
  billingController.updateSubscription
);

/**
 * @route   POST /api/v1/billing/subscription/cancel
 * @desc    Cancel subscription at period end
 * @access  Private
 */
router.post('/subscription/cancel', billingController.cancelSubscription);

/**
 * @route   GET /api/v1/billing/usage
 * @desc    Get current usage metrics
 * @access  Private
 */
router.get('/usage', billingController.getUsage);

/**
 * INVOICE ROUTES
 */

/**
 * @route   GET /api/v1/billing/invoices
 * @desc    Get all invoices for current user
 * @access  Private
 */
router.get('/invoices', billingController.getInvoices);

/**
 * @route   GET /api/v1/billing/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get('/invoices/:id', billingController.getInvoice);

/**
 * @route   GET /api/v1/billing/invoices/:id/pdf
 * @desc    Download invoice PDF
 * @access  Private
 */
router.get('/invoices/:id/pdf', billingController.downloadInvoicePdf);

/**
 * PAYMENT METHOD ROUTES
 */

/**
 * @route   GET /api/v1/billing/payment-methods
 * @desc    Get all payment methods
 * @access  Private
 */
router.get('/payment-methods', billingController.getPaymentMethods);

/**
 * @route   POST /api/v1/billing/payment-methods
 * @desc    Add new payment method
 * @access  Private
 */
router.post(
  '/payment-methods',
  validate(addPaymentMethodSchema),
  billingController.addPaymentMethod
);

/**
 * @route   DELETE /api/v1/billing/payment-methods/:id
 * @desc    Remove payment method
 * @access  Private
 */
router.delete('/payment-methods/:id', billingController.removePaymentMethod);

export default router;
