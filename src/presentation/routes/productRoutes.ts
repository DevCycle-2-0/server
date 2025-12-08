import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import {
  createProductSchema,
  updateProductSchema,
} from '@application/validators/ProductValidator';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

router.get('/:workspaceId/products', productController.list);
router.post(
  '/:workspaceId/products',
  validate(createProductSchema),
  productController.create
);
router.get('/:workspaceId/products/:id', productController.getById);
router.patch(
  '/:workspaceId/products/:id',
  validate(updateProductSchema),
  productController.update
);
router.delete('/:workspaceId/products/:id', productController.delete);
router.get('/:workspaceId/products/:id/stats', productController.getStats);

export default router;
