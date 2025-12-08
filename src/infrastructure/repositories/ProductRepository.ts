import { IProductRepository } from "@domain/repositories/IProductRepository";
import { Product } from "@domain/entities/Product.entity";
import { User } from "@domain/entities/User.entity";
import { Feature } from "@domain/entities/Feature.entity";
import { AppError } from "@shared/errors/AppError";
import { Op } from "sequelize";

export class ProductRepository implements IProductRepository {
  async create(data: Partial<Product>): Promise<Product> {
    return await Product.create(data as any);
  }

  async findById(id: string): Promise<Product | null> {
    return await Product.findByPk(id, {
      include: [{ model: User, as: "owner" }, { model: Feature }],
    });
  }

  async findAll(filters: any): Promise<{ rows: Product[]; count: number }> {
    const { page = 1, limit = 20, status, search } = filters;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return await Product.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      include: [{ model: User, as: "owner" }],
    });
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound("Product not found");
    return await product.update(data);
  }

  async delete(id: string): Promise<void> {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound("Product not found");
    await product.update({ status: "archived" });
  }
}
