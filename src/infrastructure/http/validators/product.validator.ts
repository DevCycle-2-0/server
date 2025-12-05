// src/infrastructure/http/validators/product.validator.ts
import { z } from 'zod';

/**
 * Schema for creating a new product
 * POST /products
 */
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters').max(255),
    platform: z.enum(['android', 'ios', 'web', 'dashboard', 'backend', 'api']),
    description: z.string().max(2000).optional(),
  }),
});

/**
 * Schema for updating a product
 * PATCH /products/:id
 */
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().max(2000).optional(),
    version: z.string().max(50).optional(),
    icon: z.string().url('Icon must be a valid URL').optional(),
  }),
});

/**
 * Schema for listing products with filters
 * GET /products
 */
export const listProductsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['active', 'maintenance', 'deprecated', 'archived']).optional(),
    platform: z.enum(['android', 'ios', 'web', 'dashboard', 'backend', 'api']).optional(),
    search: z.string().max(100).optional(),
    sortBy: z
      .enum(['name', 'createdAt', 'updatedAt', 'status', 'platform'])
      .default('createdAt')
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});

/**
 * Schema for getting single product
 * GET /products/:id
 */
export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

/**
 * Schema for adding team member to product
 * POST /products/:id/team
 */
export const addTeamMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

/**
 * Schema for removing team member from product
 * DELETE /products/:id/team/:userId
 */
export const removeTeamMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

/**
 * Schema for getting product stats
 * GET /products/:id/stats
 */
export const getProductStatsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

/**
 * Schema for updating product status
 * PATCH /products/:id/status
 */
export const updateProductStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    status: z.enum(['active', 'maintenance', 'deprecated', 'archived']),
  }),
});
