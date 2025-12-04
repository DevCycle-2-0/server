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
      const stepsArray = [
        {
          step: 1,
          name: 'create_product',
          title: 'Create your first Product',
          completed: steps.create_product,
        },
        {
          step: 2,
          name: 'add_feature',
          title: 'Add your first Feature',
          completed: steps.add_feature,
        },
        {
          step: 3,
          name: 'invite_team',
          title: 'Invite Team Members',
          completed: steps.invite_team,
        },
        {
          step: 4,
          name: 'setup_sprint',
          title: 'Setup your first Sprint',
          completed: steps.setup_sprint,
        },
        {
          step: 5,
          name: 'customize_workflow',
          title: 'Customize Workflow',
          completed: steps.customize_workflow,
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
      const stepNames = [
        'create_product',
        'add_feature',
        'invite_team',
        'setup_sprint',
        'customize_workflow',
      ];

      if (step >= 1 && step <= 5) {
        steps[stepNames[step - 1]] = completed;
        progress.steps = steps;

        // Find next incomplete step
        let nextStep = step + 1;
        for (let i = step; i < 5; i++) {
          if (!steps[stepNames[i]]) {
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
