import { Request, Response, NextFunction } from "express";
import { CreateProductUseCase } from "@application/use-cases/products/CreateProductUseCase";
import { GetProductsUseCase } from "@application/use-cases/products/GetProductsUseCase";
import { IProductRepository } from "@domain/repositories/IProductRepository";
import { AuthRequest } from "../middleware/authMiddleware";
import { UserRepository } from "@infrastructure/repositories/UserRepository";
import { AppError } from "@shared/errors/AppError";

export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private getProductsUseCase: GetProductsUseCase,
    private productRepository: IProductRepository
  ) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRepository = new UserRepository();
      const user = await userRepository.findById(req.user!.userId);

      const product = await this.createProductUseCase.execute({
        ...req.body,
        workspaceId: user!.workspaceId,
        ownerId: req.user!.userId,
      });

      res.status(201).json({ data: product });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getProductsUseCase.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productRepository.findById(req.params.id);
      if (!product) throw AppError.notFound("Product not found");
      res.status(200).json({ data: product });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productRepository.update(
        req.params.id,
        req.body
      );
      res.status(200).json({ data: product });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.productRepository.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
