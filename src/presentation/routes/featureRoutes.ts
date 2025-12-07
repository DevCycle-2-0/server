import { Router } from 'express';
import { FeatureController } from '../controllers/FeatureController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import {
  createFeatureSchema,
  updateFeatureSchema,
  changeFeatureStageSchema,
} from '@application/validators/FeatureValidator';

const router = Router();
const featureController = new FeatureController();

router.use(authenticate);

router.get('/:workspaceId/features', featureController.list);
router.post(
  '/:workspaceId/features',
  validate(createFeatureSchema),
  featureController.create
);
router.get('/:workspaceId/features/:id', featureController.getById);
router.patch(
  '/:workspaceId/features/:id',
  validate(updateFeatureSchema),
  featureController.update
);
router.delete('/:workspaceId/features/:id', featureController.delete);
router.post('/:workspaceId/features/:id/vote', featureController.vote);
router.delete('/:workspaceId/features/:id/vote', featureController.removeVote);
router.patch(
  '/:workspaceId/features/:id/stage',
  validate(changeFeatureStageSchema),
  featureController.changeStage
);

export default router;
