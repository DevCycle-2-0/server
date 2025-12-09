import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import { CreateProductUseCase } from "@modules/products/application/use-cases/CreateProductUseCase";
import { GetProductsUseCase } from "@modules/products/application/use-cases/GetProductsUseCase";
import { GetProductByIdUseCase } from "@modules/products/application/use-cases/GetProductByIdUseCase";
import { UpdateProductUseCase } from "@modules/products/application/use-cases/UpdateProductUseCase";
import { DeleteProductUseCase } from "@modules/products/application/use-cases/DeleteProductUseCase";
import { ProductRepository } from "@modules/products/infrastructure/persistence/repositories/ProductRepository";

export class ProductController {
  private createProductUseCase: CreateProductUseCase;
  private getProductsUseCase: GetProductsUseCase;
  private getProductByIdUseCase: GetProductByIdUseCase;
  private updateProductUseCase: UpdateProductUseCase;
  private deleteProductUseCase: DeleteProductUseCase;

  constructor() {
    const productRepository = new ProductRepository();

    this.createProductUseCase = new CreateProductUseCase(productRepository);
    this.getProductsUseCase = new GetProductsUseCase(productRepository);
    this.getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
    this.updateProductUseCase = new UpdateProductUseCase(productRepository);
    this.deleteProductUseCase = new DeleteProductUseCase(productRepository);
  }

  getProducts = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getProductsUseCase.execute({
        query: {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
          status: req.query.status as "active" | "archived" | undefined,
          platform: req.query.platform as string | undefined,
          search: req.query.search as string | undefined,
          sortBy: req.query.sortBy as
            | "name"
            | "createdAt"
            | "updatedAt"
            | undefined,
          sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      const { products, pagination } = result.getValue();
      return ApiResponse.paginated(
        res,
        products,
        pagination.page,
        pagination.limit,
        pagination.total
      );
    } catch (error) {
      console.error("Get products error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getProductById = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getProductByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      const product = result.getValue();

      // Validate workspace access
      if (product.id) {
        // Additional validation would be done here in production
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get product by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  createProduct = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // Get user name from the authenticated user
      // In production, you'd fetch this from the database
      const userName = "User"; // Placeholder

      const result = await this.createProductUseCase.execute({
        data: req.body,
        userId: req.user.userId,
        userName: userName,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Create product error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateProduct = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateProductUseCase.execute({
        productId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update product error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteProduct = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.deleteProductUseCase.execute({
        productId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete product error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getProductStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement stats calculation
      // This would aggregate data from features, bugs, sprints, etc.
      const stats = {
        totalFeatures: 0,
        activeFeatures: 0,
        completedFeatures: 0,
        openBugs: 0,
        resolvedBugs: 0,
        activeSprintsCount: 0,
        teamMembersCount: 0,
        lastActivityAt: new Date().toISOString(),
      };

      return ApiResponse.success(res, stats);
    } catch (error) {
      console.error("Get product stats error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getProductTeam = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement team member retrieval
      // This would fetch from a product_team_members table
      return ApiResponse.success(res, []);
    } catch (error) {
      console.error("Get product team error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addTeamMember = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement team member addition
      return ApiResponse.created(res, { message: "Team member added" });
    } catch (error) {
      console.error("Add team member error:", error);
      return ApiResponse.internalError(res);
    }
  };

  removeTeamMember = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement team member removal
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Remove team member error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
