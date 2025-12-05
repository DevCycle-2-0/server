import { Router } from 'express';
import { BugsController } from '../controllers/BugsController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createBugSchema,
  updateBugSchema,
  updateBugStatusSchema,
  assignBugSchema,
  linkFeatureSchema,
  assignSprintSchema,
  addRetestSchema,
} from '../validators/bug.validator';

const router = Router();
const bugsController = new BugsController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/bugs/statistics
 * @desc    Get bug statistics
 * @access  Private
 * Note: Must be before /:id to avoid treating "statistics" as an ID
 */
router.get('/statistics', bugsController.getStatistics);

/**
 * @route   GET /api/v1/bugs
 * @desc    Get all bugs with pagination and filters
 * @access  Private
 */
router.get('/', bugsController.list);

/**
 * @route   GET /api/v1/bugs/:id
 * @desc    Get bug by ID
 * @access  Private
 */
router.get('/:id', bugsController.get);

/**
 * @route   POST /api/v1/bugs
 * @desc    Create a new bug
 * @access  Private (requires bugs:create permission)
 */
router.post('/', checkPermission('bugs:create'), validate(createBugSchema), bugsController.create);

/**
 * @route   PATCH /api/v1/bugs/:id
 * @desc    Update bug
 * @access  Private (requires bugs:update permission)
 */
router.patch(
  '/:id',
  checkPermission('bugs:update'),
  validate(updateBugSchema),
  bugsController.update
);

/**
 * @route   DELETE /api/v1/bugs/:id
 * @desc    Delete bug
 * @access  Private (requires bugs:delete permission)
 */
router.delete('/:id', checkPermission('bugs:delete'), bugsController.delete);

/**
 * @route   PATCH /api/v1/bugs/:id/status
 * @desc    Update bug status
 * @access  Private (requires bugs:update permission)
 */
router.patch(
  '/:id/status',
  checkPermission('bugs:update'),
  validate(updateBugStatusSchema),
  bugsController.updateStatus
);

/**
 * @route   PATCH /api/v1/bugs/:id/assign
 * @desc    Assign bug to user
 * @access  Private (requires bugs:assign permission)
 */
router.patch(
  '/:id/assign',
  checkPermission('bugs:assign'),
  validate(assignBugSchema),
  bugsController.assign
);

/**
 * @route   DELETE /api/v1/bugs/:id/assign
 * @desc    Unassign bug
 * @access  Private (requires bugs:assign permission)
 */
router.delete('/:id/assign', checkPermission('bugs:assign'), bugsController.unassign);

/**
 * @route   POST /api/v1/bugs/:id/link-feature
 * @desc    Link bug to feature
 * @access  Private (requires bugs:update permission)
 */
router.post(
  '/:id/link-feature',
  checkPermission('bugs:update'),
  validate(linkFeatureSchema),
  bugsController.linkFeature
);

/**
 * @route   DELETE /api/v1/bugs/:id/link-feature
 * @desc    Unlink bug from feature
 * @access  Private (requires bugs:update permission)
 */
router.delete('/:id/link-feature', checkPermission('bugs:update'), bugsController.unlinkFeature);

/**
 * @route   POST /api/v1/bugs/:id/assign-sprint
 * @desc    Add bug to sprint
 * @access  Private (requires bugs:update permission)
 */
router.post(
  '/:id/assign-sprint',
  checkPermission('bugs:update'),
  validate(assignSprintSchema),
  bugsController.assignSprint
);

/**
 * @route   DELETE /api/v1/bugs/:id/assign-sprint
 * @desc    Remove bug from sprint
 * @access  Private (requires bugs:update permission)
 */
router.delete('/:id/assign-sprint', checkPermission('bugs:update'), bugsController.unassignSprint);

/**
 * @route   POST /api/v1/bugs/:id/retest
 * @desc    Add retest result
 * @access  Private (requires bugs:retest permission)
 */
router.post(
  '/:id/retest',
  checkPermission('bugs:retest'),
  validate(addRetestSchema),
  bugsController.addRetest
);

/**
 * @route   GET /api/v1/bugs/:id/retest
 * @desc    Get retest history
 * @access  Private
 */
router.get('/:id/retest', bugsController.getRetestHistory);

/**
 * @route   POST /api/v1/bugs/:id/attachments
 * @desc    Upload attachment
 * @access  Private (requires bugs:update permission)
 * Note: Requires multer middleware for file upload in production
 */
router.post('/:id/attachments', checkPermission('bugs:update'), bugsController.uploadAttachment);

/**
 * @route   DELETE /api/v1/bugs/:id/attachments/:attachmentId
 * @desc    Delete attachment
 * @access  Private (requires bugs:update permission)
 */
router.delete(
  '/:id/attachments/:attachmentId',
  checkPermission('bugs:update'),
  bugsController.deleteAttachment
);

/**
 * Comment routes are handled by the comments router
 * GET    /api/v1/bug/:bugId/comments
 * POST   /api/v1/bug/:bugId/comments
 * PATCH  /api/v1/comments/:commentId
 * DELETE /api/v1/comments/:commentId
 */

export default router;
