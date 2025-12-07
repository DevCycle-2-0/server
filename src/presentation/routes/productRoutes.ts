import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

router.get('/:workspaceId/products', productController.list);
router.post('/:workspaceId/products', productController.create);
router.get('/:workspaceId/products/:id', productController.getById);
router.patch('/:workspaceId/products/:id', productController.update);
router.delete('/:workspaceId/products/:id', productController.delete);
router.get('/:workspaceId/products/:id/stats', productController.getStats);

export default router;
