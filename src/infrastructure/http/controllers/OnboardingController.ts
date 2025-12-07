import { Response, NextFunction } from 'express';
import { OnboardingProgressModel } from '@infrastructure/database/models/OnboardingProgressModel';
import { AuthRequest } from '../middleware/auth.middleware';

export class OnboardingController {
  getStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let progress = await OnboardingProgressModel.findOne({
        where: { user_id: req.user!.sub },
      });

      if (!progress) {
        progress = await OnboardingProgressModel.create({
          user_id: req.user!.sub,
        });
      }

      const steps = progress.steps as any;

      // ✅ UPDATED: Step names now match documentation
      const stepsArray = [
        {
          step: 1,
          name: 'workspace_setup',
          title: 'Set up your workspace',
          completed: steps.workspace_setup?.completed || false,
          completedAt: steps.workspace_setup?.completedAt || null,
        },
        {
          step: 2,
          name: 'invite_team',
          title: 'Invite your team',
          completed: steps.invite_team?.completed || false,
          completedAt: steps.invite_team?.completedAt || null,
        },
        {
          step: 3,
          name: 'create_product',
          title: 'Create your first product',
          completed: steps.create_product?.completed || false,
          completedAt: steps.create_product?.completedAt || null,
        },
        {
          step: 4,
          name: 'add_feature',
          title: 'Add your first feature',
          completed: steps.add_feature?.completed || false,
          completedAt: steps.add_feature?.completedAt || null,
        },
        {
          step: 5,
          name: 'complete_setup',
          title: 'Complete your setup',
          completed: steps.complete_setup?.completed || false,
          completedAt: steps.complete_setup?.completedAt || null,
        },
      ];

      res.json({
        success: true,
        data: {
          isComplete: progress.is_complete,
          currentStep: progress.current_step,
          totalSteps: 5,
          steps: stepsArray,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { step, completed } = req.body;

      let progress = await OnboardingProgressModel.findOne({
        where: { user_id: req.user!.sub },
      });

      if (!progress) {
        progress = await OnboardingProgressModel.create({
          user_id: req.user!.sub,
        });
      }

      const steps = progress.steps as any;

      // ✅ UPDATED: Step names array matches documentation
      const stepNames = [
        'workspace_setup',
        'invite_team',
        'create_product',
        'add_feature',
        'complete_setup',
      ];

      if (step >= 1 && step <= 5) {
        // ✅ Update with timestamp
        steps[stepNames[step - 1]] = {
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        };
        progress.steps = steps;

        // Find next incomplete step
        let nextStep = step + 1;
        for (let i = step; i < 5; i++) {
          if (!steps[stepNames[i]]?.completed) {
            nextStep = i + 1;
            break;
          }
        }
        progress.current_step = Math.min(nextStep, 5);

        await progress.save();
      }

      res.json({
        success: true,
        data: {
          isComplete: progress.is_complete,
          currentStep: progress.current_step,
          totalSteps: 5,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let progress = await OnboardingProgressModel.findOne({
        where: { user_id: req.user!.sub },
      });

      if (!progress) {
        progress = await OnboardingProgressModel.create({
          user_id: req.user!.sub,
        });
      }

      progress.is_complete = true;
      progress.completed_at = new Date();
      await progress.save();

      res.json({
        success: true,
        data: {
          isComplete: true,
          completedAt: progress.completed_at,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  skip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let progress = await OnboardingProgressModel.findOne({
        where: { user_id: req.user!.sub },
      });

      if (!progress) {
        progress = await OnboardingProgressModel.create({
          user_id: req.user!.sub,
        });
      }

      progress.is_complete = true;
      progress.completed_at = new Date();
      await progress.save();

      res.json({
        success: true,
        message: 'Onboarding skipped',
      });
    } catch (error) {
      next(error);
    }
  };
}
