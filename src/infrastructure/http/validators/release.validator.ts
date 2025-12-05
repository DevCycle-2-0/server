import { z } from 'zod';

/* ---------------------------------------------------------
   SHARED SCHEMAS
--------------------------------------------------------- */

export const releaseIdParam = z.object({
  id: z.string().uuid('Invalid release ID'),
});

export const stageParam = z.object({
  stage: z.enum(['build', 'test', 'staging', 'production']),
});

/* ---------------------------------------------------------
   CREATE RELEASE
--------------------------------------------------------- */
export const createReleaseSchema = z.object({
  body: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid semver format (e.g., 1.0.0)'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    productId: z.string().uuid('Invalid product ID'),
    releaseDate: z.string().date().optional(),
    releaseNotes: z.string().optional(),
    featureIds: z.array(z.string().uuid()).optional(),
    bugfixIds: z.array(z.string().uuid()).optional(),
  }),
});

/* ---------------------------------------------------------
   UPDATE RELEASE
--------------------------------------------------------- */
export const updateReleaseSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/)
      .optional(),
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    releaseNotes: z.string().optional(),
    releaseDate: z.string().date().optional(),
  }),
});

/* ---------------------------------------------------------
   UPDATE STATUS
--------------------------------------------------------- */
export const updateStatusSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    status: z.enum(['planning', 'ready', 'staging', 'production', 'released', 'rolled_back']),
  }),
});

/* ---------------------------------------------------------
   UPDATE NOTES
--------------------------------------------------------- */
export const updateNotesSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    notes: z.string().min(5, 'Notes must contain at least 5 characters'),
  }),
});

/* ---------------------------------------------------------
   DEPLOY RELEASE
--------------------------------------------------------- */
export const deployReleaseSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    environment: z.enum(['staging', 'production']),
    notes: z.string().optional(),
  }),
});

/* ---------------------------------------------------------
   ROLLBACK RELEASE
--------------------------------------------------------- */
export const rollbackReleaseSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    targetVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/)
      .optional(),
  }),
});

/* ---------------------------------------------------------
   PIPELINE: START STAGE
--------------------------------------------------------- */
export const startPipelineStageSchema = z.object({
  params: releaseIdParam.merge(stageParam),
});

/* ---------------------------------------------------------
   PIPELINE: COMPLETE STAGE
--------------------------------------------------------- */
export const completePipelineStageSchema = z.object({
  params: releaseIdParam.merge(stageParam),
  body: z.object({
    success: z.boolean(),
    notes: z.string().optional(),
  }),
});

/* ---------------------------------------------------------
   PIPELINE: RETRY STAGE
--------------------------------------------------------- */
export const retryPipelineStageSchema = z.object({
  params: releaseIdParam.merge(stageParam),
});

/* ---------------------------------------------------------
   LINK FEATURE
--------------------------------------------------------- */
export const linkFeatureSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    featureId: z.string().uuid(),
  }),
});

/* ---------------------------------------------------------
   UNLINK FEATURE
--------------------------------------------------------- */
export const unlinkFeatureSchema = z.object({
  params: releaseIdParam.extend({
    featureId: z.string().uuid(),
  }),
});

/* ---------------------------------------------------------
   LINK BUG FIX
--------------------------------------------------------- */
export const linkBugfixSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    bugId: z.string().uuid(),
  }),
});

/* ---------------------------------------------------------
   UNLINK BUG FIX
--------------------------------------------------------- */
export const unlinkBugfixSchema = z.object({
  params: releaseIdParam.extend({
    bugId: z.string().uuid(),
  }),
});

/* ---------------------------------------------------------
   REQUEST APPROVAL
--------------------------------------------------------- */
export const requestApprovalSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    approvers: z.array(z.string().uuid()).min(1, 'At least one approver required'),
  }),
});

/* ---------------------------------------------------------
   APPROVE RELEASE
--------------------------------------------------------- */
export const approveReleaseSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    comment: z.string().optional(),
  }),
});

/* ---------------------------------------------------------
   REJECT RELEASE
--------------------------------------------------------- */
export const rejectReleaseSchema = z.object({
  params: releaseIdParam,
  body: z.object({
    reason: z.string().min(3, 'Reason must be at least 3 characters'),
  }),
});
