import { IProductRepository } from '@domain/repositories/IProductRepository';
import { Product } from '@domain/entities/Product';
import { ProductModel } from '../models/ProductModel';

export class ProductRepository implements IProductRepository {
  async create(product: Product): Promise<Product> {
    const created = await ProductModel.create({
      id: product.id,
      workspaceId: product.workspaceId,
      name: product.name,
      description: product.description,
      logoUrl: product.logoUrl,
      color: product.color,
      status: product.status,
      settings: product.settings,
      createdBy: product.createdBy,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await ProductModel.findByPk(id);
    return product ? this.toDomain(product) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number
  ): Promise<{ products: Product[]; total: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await ProductModel.findAndCountAll({
      where: { workspaceId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      products: rows.map(p => this.toDomain(p)),
      total: count,
    };
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await ProductModel.update(data, { where: { id } });
    const updated = await ProductModel.findByPk(id);
    if (!updated) throw new Error('Product not found');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await ProductModel.destroy({ where: { id } });
  }

  private toDomain(model: ProductModel): Product {
    return new Product(
      model.id,
      model.workspaceId,
      model.name,
      model.description,
      model.logoUrl,
      model.color,
      model.status,
      model.settings,
      model.createdBy,
      model.createdAt,
      model.updatedAt
    );
  }
}
