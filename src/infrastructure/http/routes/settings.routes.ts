import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSettings);
router.get('/profile', settingsController.getProfile);
router.patch('/profile', settingsController.updateProfile);
router.get('/notifications', settingsController.getNotifications);
router.patch('/notifications', settingsController.updateNotifications);

export default router;
