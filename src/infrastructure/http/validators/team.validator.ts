import { z } from 'zod';

export const updateAvailabilitySchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    availability: z.enum(['available', 'busy', 'away', 'offline']),
  }),
});

export const updateSkillsSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    skills: z.array(z.string()).min(1, 'At least one skill required'),
  }),
});

export const inviteTeamMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['owner', 'admin', 'product_manager', 'developer', 'designer', 'qa', 'viewer']),
  }),
});
