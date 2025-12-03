import { IProductRepository } from '@core/domain/repositories/IProductRepository';
import { Product, ProductStatus, PlatformType } from '@core/domain/entities/Product';
import { ProductModel } from '../models/ProductModel';

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const model = await ProductModel.findByPk(id);
    if (!model) return null;

    return Product.reconstitute(
      model.id,
      model.workspace_id,
      model.name,
      model.description || null,
      model.platform as PlatformType,
      model.version || null,
      model.status as ProductStatus,
      model.icon || null,
      model.settings,
      model.created_at,
      model.updated_at
    );
  }

  async findByWorkspace(workspaceId: string): Promise<Product[]> {
    const models = await ProductModel.findAll({
      where: { workspace_id: workspaceId },
      order: [['created_at', 'DESC']],
    });

    return models.map((model) =>
      Product.reconstitute(
        model.id,
        model.workspace_id,
        model.name,
        model.description || null,
        model.platform as PlatformType,
        model.version || null,
        model.status as ProductStatus,
        model.icon || null,
        model.settings,
        model.created_at,
        model.updated_at
      )
    );
  }

  async save(product: Product): Promise<void> {
    await ProductModel.create({
      id: product.id,
      workspace_id: product.workspaceId,
      name: product.name,
      description: product.description,
      platform: product.platform,
      version: product.version,
      status: product.status,
      icon: product.icon,
      settings: product.settings,
    });
  }

  async update(product: Product): Promise<void> {
    await ProductModel.update(
      {
        name: product.name,
        description: product.description,
        version: product.version,
        status: product.status,
        icon: product.icon,
        settings: product.settings,
        updated_at: product.updatedAt,
      },
      {
        where: { id: product.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await ProductModel.destroy({ where: { id } });
  }
}
