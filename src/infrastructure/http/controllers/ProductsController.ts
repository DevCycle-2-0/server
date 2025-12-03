import { Response, NextFunction } from 'express';
import { CreateProduct } from '@core/application/use-cases/products/CreateProduct';
import { ListProducts } from '@core/application/use-cases/products/ListProducts';
import { UpdateProduct } from '@core/application/use-cases/products/UpdateProduct';
import { ProductRepository } from '@infrastructure/database/repositories/ProductRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProductsController {
  private createProduct: CreateProduct;
  private listProducts: ListProducts;
  private updateProduct: UpdateProduct;
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.createProduct = new CreateProduct(this.productRepository);
    this.listProducts = new ListProducts(this.productRepository);
    this.updateProduct = new UpdateProduct(this.productRepository);
  }

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

      const result = await this.listProducts.execute({ workspaceId });

      res.json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

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

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.productRepository.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
