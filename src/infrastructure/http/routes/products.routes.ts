import { Router } from 'express';
import { ProductsController } from '../controllers/ProductsController';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import {
  createProductSchema,
  updateProductSchema,
  addTeamMemberSchema,
} from '../validators/product.validator';

const router = Router();
const productsController = new ProductsController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/products
 * @desc    List all products with pagination, filtering, sorting
 * @access  Private
 * @query   page, limit, status, platform, search, sortBy, sortOrder
 */
router.get('/', productsController.list);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get single product by ID
 * @access  Private
 */
router.get('/:id', productsController.get);

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (requires products:create permission)
 */
router.post(
  '/',
  checkPermission('products:create'),
  validate(createProductSchema),
  productsController.create
);

/**
 * @route   PATCH /api/v1/products/:id
 * @desc    Update a product
 * @access  Private (requires products:update permission)
 */
router.patch(
  '/:id',
  checkPermission('products:update'),
  validate(updateProductSchema),
  productsController.update
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete a product
 * @access  Private (requires products:delete permission)
 */
router.delete('/:id', checkPermission('products:delete'), productsController.delete);

/**
 * @route   GET /api/v1/products/:id/stats
 * @desc    Get product statistics
 * @access  Private
 */
router.get('/:id/stats', productsController.getStats);

/**
 * @route   GET /api/v1/products/:id/team
 * @desc    Get product team members
 * @access  Private
 */
router.get('/:id/team', productsController.getTeam);

/**
 * @route   POST /api/v1/products/:id/team
 * @desc    Add team member to product
 * @access  Private (requires products:manage_team permission)
 */
router.post(
  '/:id/team',
  checkPermission('products:manage_team'),
  validate(addTeamMemberSchema),
  productsController.addTeamMember
);

/**
 * @route   DELETE /api/v1/products/:id/team/:userId
 * @desc    Remove team member from product
 * @access  Private (requires products:manage_team permission)
 */
router.delete(
  '/:id/team/:userId',
  checkPermission('products:manage_team'),
  productsController.removeTeamMember
);

export default router;
