import { Router } from 'express';
import { ReleasesController } from '../controllers/ReleasesController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createReleaseSchema,
  updateReleaseSchema,
  updateStatusSchema,
  deployReleaseSchema,
  rollbackReleaseSchema,
  updateNotesSchema,
  linkFeatureSchema,
  linkBugfixSchema,
  requestApprovalSchema,
  approveReleaseSchema,
  rejectReleaseSchema,
  completePipelineStageSchema,
} from '../validators/release.validator';

const router = Router();
const releasesController = new ReleasesController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/releases
 * @desc    List all releases with pagination and filters
 * @access  Private
 * @query   page, limit, status, productId, search
 */
router.get('/', releasesController.list);

/**
 * @route   GET /api/v1/releases/:id
 * @desc    Get single release by ID
 * @access  Private
 */
router.get('/:id', releasesController.get);

/**
 * @route   POST /api/v1/releases
 * @desc    Create new release
 * @access  Private (requires releases:create permission)
 */
router.post(
  '/',
  checkPermission('releases:create'),
  validate(createReleaseSchema),
  releasesController.create
);

/**
 * @route   PATCH /api/v1/releases/:id
 * @desc    Update release
 * @access  Private (requires releases:update permission)
 */
router.patch(
  '/:id',
  checkPermission('releases:update'),
  validate(updateReleaseSchema),
  releasesController.update
);

/**
 * @route   DELETE /api/v1/releases/:id
 * @desc    Delete release
 * @access  Private (requires releases:delete permission)
 */
router.delete('/:id', checkPermission('releases:delete'), releasesController.delete);

/**
 * @route   PATCH /api/v1/releases/:id/status
 * @desc    Update release status
 * @access  Private (requires releases:update permission)
 */
router.patch(
  '/:id/status',
  checkPermission('releases:update'),
  validate(updateStatusSchema),
  releasesController.updateStatus
);

// ========== Pipeline Management ==========

/**
 * @route   GET /api/v1/releases/:id/pipeline
 * @desc    Get pipeline status
 * @access  Private
 */
router.get('/:id/pipeline', releasesController.getPipeline);

/**
 * @route   POST /api/v1/releases/:id/pipeline/:stage/start
 * @desc    Start pipeline stage
 * @access  Private (requires releases:deploy permission)
 * @param   stage - build, test, staging, production
 */
router.post(
  '/:id/pipeline/:stage/start',
  checkPermission('releases:deploy'),
  releasesController.startPipelineStage
);

/**
 * @route   POST /api/v1/releases/:id/pipeline/:stage/complete
 * @desc    Complete pipeline stage
 * @access  Private (requires releases:deploy permission)
 */
router.post(
  '/:id/pipeline/:stage/complete',
  checkPermission('releases:deploy'),
  validate(completePipelineStageSchema),
  releasesController.completePipelineStage
);

/**
 * @route   POST /api/v1/releases/:id/pipeline/:stage/retry
 * @desc    Retry pipeline stage
 * @access  Private (requires releases:deploy permission)
 */
router.post(
  '/:id/pipeline/:stage/retry',
  checkPermission('releases:deploy'),
  releasesController.retryPipelineStage
);

// ========== Deployment & Rollback ==========

/**
 * @route   POST /api/v1/releases/:id/deploy
 * @desc    Deploy release to environment
 * @access  Private (requires releases:deploy permission)
 */
router.post(
  '/:id/deploy',
  checkPermission('releases:deploy'),
  validate(deployReleaseSchema),
  releasesController.deploy
);

/**
 * @route   POST /api/v1/releases/:id/rollback
 * @desc    Rollback release
 * @access  Private (requires releases:deploy permission)
 */
router.post(
  '/:id/rollback',
  checkPermission('releases:deploy'),
  validate(rollbackReleaseSchema),
  releasesController.rollback
);

/**
 * @route   GET /api/v1/releases/:id/rollbacks
 * @desc    Get rollback history
 * @access  Private
 */
router.get('/:id/rollbacks', releasesController.getRollbacks);

/**
 * @route   GET /api/v1/releases/:id/deployments
 * @desc    Get deployment history (legacy)
 * @access  Private
 */
router.get('/:id/deployments', releasesController.getDeployments);

// ========== Release Notes ==========

/**
 * @route   PATCH /api/v1/releases/:id/notes
 * @desc    Update release notes
 * @access  Private (requires releases:update permission)
 */
router.patch(
  '/:id/notes',
  checkPermission('releases:update'),
  validate(updateNotesSchema),
  releasesController.updateNotes
);

/**
 * @route   POST /api/v1/releases/:id/notes/generate
 * @desc    Generate release notes from linked features/bugs
 * @access  Private
 */
router.post('/:id/notes/generate', releasesController.generateNotes);

/**
 * @route   GET /api/v1/releases/:id/notes/export
 * @desc    Export release notes
 * @access  Private
 * @query   format - markdown, html, pdf
 */
router.get('/:id/notes/export', releasesController.exportNotes);

// ========== Feature & Bugfix Linking ==========

/**
 * @route   POST /api/v1/releases/:id/features
 * @desc    Link feature to release
 * @access  Private (requires releases:update permission)
 */
router.post(
  '/:id/features',
  checkPermission('releases:update'),
  validate(linkFeatureSchema),
  releasesController.linkFeature
);

/**
 * @route   DELETE /api/v1/releases/:id/features/:featureId
 * @desc    Unlink feature from release
 * @access  Private (requires releases:update permission)
 */
router.delete(
  '/:id/features/:featureId',
  checkPermission('releases:update'),
  releasesController.unlinkFeature
);

/**
 * @route   POST /api/v1/releases/:id/bugfixes
 * @desc    Link bugfix to release
 * @access  Private (requires releases:update permission)
 */
router.post(
  '/:id/bugfixes',
  checkPermission('releases:update'),
  validate(linkBugfixSchema),
  releasesController.linkBugfix
);

/**
 * @route   DELETE /api/v1/releases/:id/bugfixes/:bugId
 * @desc    Unlink bugfix from release
 * @access  Private (requires releases:update permission)
 */
router.delete(
  '/:id/bugfixes/:bugId',
  checkPermission('releases:update'),
  releasesController.unlinkBugfix
);

// ========== Approval Workflow ==========

/**
 * @route   POST /api/v1/releases/:id/approval/request
 * @desc    Request release approval
 * @access  Private (requires releases:approve permission)
 */
router.post(
  '/:id/approval/request',
  checkPermission('releases:approve'),
  validate(requestApprovalSchema),
  releasesController.requestApproval
);

/**
 * @route   POST /api/v1/releases/:id/approval/approve
 * @desc    Approve release
 * @access  Private
 */
router.post(
  '/:id/approval/approve',
  validate(approveReleaseSchema),
  releasesController.approveRelease
);

/**
 * @route   POST /api/v1/releases/:id/approval/reject
 * @desc    Reject release
 * @access  Private
 */
router.post(
  '/:id/approval/reject',
  validate(rejectReleaseSchema),
  releasesController.rejectRelease
);

/**
 * @route   GET /api/v1/releases/:id/approval/status
 * @desc    Get approval status
 * @access  Private
 */
router.get('/:id/approval/status', releasesController.getApprovalStatus);

export default router;
