import { Router } from 'express';
import { FeaturesController } from '../controllers/FeaturesController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createFeatureSchema,
  updateFeatureSchema,
  updateFeatureStatusSchema,
  assignSprintSchema,
  approveFeatureSchema,
  rejectFeatureSchema,
} from '../validators/feature.validator';

const router = Router();
const featuresController = new FeaturesController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/features
 * @desc    List all features with pagination and filters
 * @access  Private
 */
router.get('/', featuresController.list);

/**
 * @route   GET /api/v1/features/:id
 * @desc    Get single feature by ID
 * @access  Private
 */
router.get('/:id', featuresController.get);

/**
 * @route   POST /api/v1/features
 * @desc    Create a new feature
 * @access  Private (requires features:create permission)
 */
router.post(
  '/',
  checkPermission('features:create'),
  validate(createFeatureSchema),
  featuresController.create
);

/**
 * @route   PATCH /api/v1/features/:id
 * @desc    Update feature
 * @access  Private (requires features:update permission)
 */
router.patch(
  '/:id',
  checkPermission('features:update'),
  validate(updateFeatureSchema),
  featuresController.update
);

/**
 * @route   DELETE /api/v1/features/:id
 * @desc    Delete feature
 * @access  Private (requires features:delete permission)
 */
router.delete('/:id', checkPermission('features:delete'), featuresController.delete);

/**
 * @route   PATCH /api/v1/features/:id/status
 * @desc    Update feature status
 * @access  Private (requires features:update permission)
 */
router.patch(
  '/:id/status',
  checkPermission('features:update'),
  validate(updateFeatureStatusSchema),
  featuresController.updateStatus
);

/**
 * @route   POST /api/v1/features/:id/assign-sprint
 * @desc    Assign feature to sprint
 * @access  Private (requires features:update permission)
 */
router.post(
  '/:id/assign-sprint',
  checkPermission('features:update'),
  validate(assignSprintSchema),
  featuresController.assignSprint
);

/**
 * @route   DELETE /api/v1/features/:id/assign-sprint
 * @desc    Unassign feature from sprint
 * @access  Private (requires features:update permission)
 */
router.delete(
  '/:id/assign-sprint',
  checkPermission('features:update'),
  featuresController.unassignSprint
);

/**
 * @route   POST /api/v1/features/:id/vote
 * @desc    Vote for feature
 * @access  Private
 */
router.post('/:id/vote', featuresController.vote);

/**
 * @route   DELETE /api/v1/features/:id/vote
 * @desc    Remove vote from feature
 * @access  Private
 */
router.delete('/:id/vote', featuresController.unvote);

/**
 * @route   POST /api/v1/features/:id/approve
 * @desc    Approve feature
 * @access  Private (requires features:approve permission)
 */
router.post(
  '/:id/approve',
  checkPermission('features:approve'),
  validate(approveFeatureSchema),
  featuresController.approve
);

/**
 * @route   POST /api/v1/features/:id/reject
 * @desc    Reject feature
 * @access  Private (requires features:approve permission)
 */
router.post(
  '/:id/reject',
  checkPermission('features:approve'),
  validate(rejectFeatureSchema),
  featuresController.reject
);

/**
 * @route   GET /api/v1/features/:id/tasks
 * @desc    Get all tasks linked to feature
 * @access  Private
 */
router.get('/:id/tasks', featuresController.getTasks);

/**
 * Comment routes are handled by the comments router
 * GET    /api/v1/feature/:featureId/comments
 * POST   /api/v1/feature/:featureId/comments
 * PATCH  /api/v1/comments/:commentId
 * DELETE /api/v1/comments/:commentId
 */

export default router;
