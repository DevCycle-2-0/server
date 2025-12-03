import { Router } from 'express';
import { ProductsController } from '../controllers/ProductsController';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();
const productsController = new ProductsController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/products
 * @desc    List all products in workspace
 * @access  Private
 */
router.get('/', productsController.list);

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

export default router;
