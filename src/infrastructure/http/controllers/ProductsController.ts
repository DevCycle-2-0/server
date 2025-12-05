// src/infrastructure/http/controllers/ProductsController.ts
import { Response, NextFunction } from 'express';
import { CreateProduct } from '@core/application/use-cases/products/CreateProduct';
import { ListProducts } from '@core/application/use-cases/products/ListProducts';
import { UpdateProduct } from '@core/application/use-cases/products/UpdateProduct';
import { ProductRepository } from '@infrastructure/database/repositories/ProductRepository';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { AuthRequest } from '../middleware/auth.middleware';
import { Op } from 'sequelize';

export class ProductsController {
  private createProduct: CreateProduct;
  private listProducts: ListProducts;
  private updateProduct: UpdateProduct;
  private productRepository: ProductRepository;
  private featureRepository: FeatureRepository;
  private sprintRepository: SprintRepository;
  private bugRepository: BugRepository;
  private taskRepository: TaskRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.featureRepository = new FeatureRepository();
    this.sprintRepository = new SprintRepository();
    this.bugRepository = new BugRepository();
    this.taskRepository = new TaskRepository();
    this.createProduct = new CreateProduct(this.productRepository);
    this.listProducts = new ListProducts(this.productRepository);
    this.updateProduct = new UpdateProduct(this.productRepository);
  }

  /**
   * GET /products
   * List all products with pagination, filtering, sorting
   */
  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;

      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User must belong to a workspace',
          },
        });
        return;
      }

      const {
        page = '1',
        limit = '10',
        status,
        platform,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Get all products for workspace
      const allProducts = await this.productRepository.findByWorkspace(workspaceId);

      // Apply filters
      let filteredProducts = allProducts;

      if (status) {
        filteredProducts = filteredProducts.filter((p) => p.status === status);
      }

      if (platform) {
        filteredProducts = filteredProducts.filter((p) => p.platform === platform);
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Sort
      const sortField = sortBy as string;
      const order = sortOrder as string;
      filteredProducts.sort((a, b) => {
        const aVal = (a as any)[sortField];
        const bVal = (b as any)[sortField];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });

      // Paginate
      const total = filteredProducts.length;
      const paginatedProducts = filteredProducts.slice(offset, offset + limitNum);

      res.json({
        success: true,
        data: paginatedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          platform: p.platform,
          version: p.version,
          status: p.status,
          icon: p.icon,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/:id
   * Get single product by ID
   */
  get = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await this.productRepository.findById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: product.id,
          workspaceId: product.workspaceId,
          name: product.name,
          description: product.description,
          platform: product.platform,
          version: product.version,
          status: product.status,
          icon: product.icon,
          settings: product.settings,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /products
   * Create new product
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, platform, description } = req.body;
      const workspaceId = req.user!.workspaceId;

      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User must belong to a workspace',
          },
        });
        return;
      }

      const result = await this.createProduct.execute({
        workspaceId,
        name,
        platform,
        description,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /products/:id
   * Update product
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, version, icon } = req.body;

      await this.updateProduct.execute({
        productId: id,
        name,
        description,
        version,
        icon,
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /products/:id
   * Delete product
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.productRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/:id/stats
   * Get product statistics
   */
  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Verify product exists
      const product = await this.productRepository.findById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
        return;
      }

      // Get features
      const features = await this.featureRepository.findByProduct(id);
      const featuresCount = features.length;

      // Get sprints
      const sprints = await this.sprintRepository.findByProduct(id);
      const activeSprintsCount = sprints.filter((s) => s.isActive()).length;

      // Get bugs
      const bugs = await this.bugRepository.findByProduct(id);
      const openBugsCount = bugs.filter((b) => !b.isResolved()).length;

      // Get tasks from features
      let completedTasksCount = 0;
      for (const feature of features) {
        const tasks = await this.taskRepository.findByFeature(feature.id);
        completedTasksCount += tasks.filter((t) => t.isCompleted()).length;
      }

      res.json({
        success: true,
        data: {
          featuresCount,
          activeSprintsCount,
          openBugsCount,
          completedTasksCount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/:id/team
   * Get product team members
   * Note: This is a simplified implementation
   * In production, you'd have a ProductTeam join table
   */
  getTeam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Verify product exists
      const product = await this.productRepository.findById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
        return;
      }

      // Get unique assignees from features, tasks, and bugs
      const features = await this.featureRepository.findByProduct(id);
      const bugs = await this.bugRepository.findByProduct(id);

      const teamMemberIds = new Set<string>();

      // Add feature assignees
      features.forEach((f) => {
        if (f.assigneeId) teamMemberIds.add(f.assigneeId);
      });

      // Add bug assignees and reporters
      bugs.forEach((b) => {
        if (b.assigneeId) teamMemberIds.add(b.assigneeId);
        if (b.reporterId) teamMemberIds.add(b.reporterId);
      });

      // Get tasks from features
      for (const feature of features) {
        const tasks = await this.taskRepository.findByFeature(feature.id);
        tasks.forEach((t) => {
          if (t.assigneeId) teamMemberIds.add(t.assigneeId);
        });
      }

      res.json({
        success: true,
        data: Array.from(teamMemberIds),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /products/:id/team
   * Add team member to product
   * Note: This is a placeholder - would need ProductTeam model
   */
  addTeamMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Verify product exists
      const product = await this.productRepository.findById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
        return;
      }

      // In production: Create ProductTeam entry
      // await ProductTeamModel.create({ product_id: id, user_id: userId });

      res.status(201).json({
        success: true,
        message: 'Team member added successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /products/:id/team/:userId
   * Remove team member from product
   */
  removeTeamMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, userId } = req.params;

      // Verify product exists
      const product = await this.productRepository.findById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
        return;
      }

      // In production: Delete ProductTeam entry
      // await ProductTeamModel.destroy({ where: { product_id: id, user_id: userId } });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
