import { Router } from 'express';
import { SprintsController } from '../controllers/SprintsController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createSprintSchema,
  updateSprintSchema,
  addTaskSchema,
  addBugSchema,
  saveRetrospectiveSchema,
} from '../validators/sprint.validator';

const router = Router();
const sprintsController = new SprintsController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/sprints
 * @desc    List all sprints with pagination and filters
 * @access  Private
 * @query   page, limit, status, productId
 */
router.get('/', sprintsController.list);

/**
 * @route   GET /api/v1/sprints/:id
 * @desc    Get sprint by ID
 * @access  Private
 */
router.get('/:id', sprintsController.get);

/**
 * @route   POST /api/v1/sprints
 * @desc    Create new sprint
 * @access  Private (requires sprints:create permission)
 */
router.post(
  '/',
  checkPermission('sprints:create'),
  validate(createSprintSchema),
  sprintsController.create
);

/**
 * @route   PATCH /api/v1/sprints/:id
 * @desc    Update sprint
 * @access  Private (requires sprints:update permission)
 */
router.patch(
  '/:id',
  checkPermission('sprints:update'),
  validate(updateSprintSchema),
  sprintsController.update
);

/**
 * @route   DELETE /api/v1/sprints/:id
 * @desc    Delete sprint
 * @access  Private (requires sprints:delete permission)
 */
router.delete('/:id', checkPermission('sprints:delete'), sprintsController.delete);

/**
 * @route   POST /api/v1/sprints/:id/start
 * @desc    Start sprint
 * @access  Private (requires sprints:update permission)
 */
router.post('/:id/start', checkPermission('sprints:update'), sprintsController.start);

/**
 * @route   POST /api/v1/sprints/:id/complete
 * @desc    Complete sprint
 * @access  Private (requires sprints:update permission)
 */
router.post('/:id/complete', checkPermission('sprints:update'), sprintsController.complete);

/**
 * @route   GET /api/v1/sprints/:id/tasks
 * @desc    Get sprint tasks
 * @access  Private
 */
router.get('/:id/tasks', sprintsController.getTasks);

/**
 * @route   POST /api/v1/sprints/:id/tasks
 * @desc    Add task to sprint
 * @access  Private (requires sprints:update permission)
 */
router.post(
  '/:id/tasks',
  checkPermission('sprints:update'),
  validate(addTaskSchema),
  sprintsController.addTask
);

/**
 * @route   DELETE /api/v1/sprints/:id/tasks/:taskId
 * @desc    Remove task from sprint
 * @access  Private (requires sprints:update permission)
 */
router.delete(
  '/:id/tasks/:taskId',
  checkPermission('sprints:update'),
  sprintsController.removeTask
);

/**
 * @route   GET /api/v1/sprints/:id/bugs
 * @desc    Get sprint bugs
 * @access  Private
 */
router.get('/:id/bugs', sprintsController.getBugs);

/**
 * @route   POST /api/v1/sprints/:id/bugs
 * @desc    Add bug to sprint
 * @access  Private (requires sprints:update permission)
 */
router.post(
  '/:id/bugs',
  checkPermission('sprints:update'),
  validate(addBugSchema),
  sprintsController.addBug
);

/**
 * @route   DELETE /api/v1/sprints/:id/bugs/:bugId
 * @desc    Remove bug from sprint
 * @access  Private (requires sprints:update permission)
 */
router.delete('/:id/bugs/:bugId', checkPermission('sprints:update'), sprintsController.removeBug);

/**
 * @route   GET /api/v1/sprints/:id/metrics
 * @desc    Get sprint metrics
 * @access  Private
 */
router.get('/:id/metrics', sprintsController.getMetrics);

/**
 * @route   GET /api/v1/sprints/:id/retrospective
 * @desc    Get sprint retrospective
 * @access  Private
 */
router.get('/:id/retrospective', sprintsController.getRetrospective);

/**
 * @route   POST /api/v1/sprints/:id/retrospective
 * @desc    Save sprint retrospective
 * @access  Private (requires sprints:update permission)
 */
router.post(
  '/:id/retrospective',
  checkPermission('sprints:update'),
  validate(saveRetrospectiveSchema),
  sprintsController.saveRetrospective
);

export default router;
