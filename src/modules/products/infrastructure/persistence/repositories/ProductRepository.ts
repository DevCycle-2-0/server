import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import {
  IProductRepository,
  ProductFilters,
  ProductSortOptions,
} from "@modules/products/domain/repositories/IProductRepository";
import { Product, Platform } from "@modules/products/domain/entities/Product";
import { ProductModel } from "../models/ProductModel";
import { Op } from "sequelize";

export class ProductRepository
  extends BaseRepository<Product, ProductModel>
  implements IProductRepository
{
  constructor() {
    super(ProductModel);
  }

  protected toDomain(model: ProductModel): Product {
    return Product.create(
      {
        name: model.name,
        description: model.description,
        platforms: model.platforms as Platform[],
        ownerId: model.ownerId,
        ownerName: model.ownerName,
        workspaceId: model.workspaceId,
        status: model.status,
        featuresCount: model.featuresCount,
        bugsCount: model.bugsCount,
        teamMembersCount: model.teamMembersCount,
      },
      model.id
    );
  }

  protected toModel(domain: Product): Partial<ProductModel> {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      platforms: domain.platforms,
      ownerId: domain.ownerId,
      ownerName: domain.ownerName,
      workspaceId: domain.workspaceId,
      status: domain.status,
      featuresCount: domain.featuresCount,
      bugsCount: domain.bugsCount,
      teamMembersCount: domain.teamMembersCount,
    };
  }

  async findAll(
    filters: ProductFilters,
    sortOptions: ProductSortOptions,
    page: number,
    limit: number
  ): Promise<{ products: Product[]; total: number }> {
    const where: any = {
      workspaceId: filters.workspaceId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.platform) {
      where.platforms = {
        [Op.contains]: [filters.platform],
      };
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const order: any[] = [];
    if (sortOptions.sortBy) {
      order.push([sortOptions.sortBy, sortOptions.sortOrder || "asc"]);
    } else {
      order.push(["createdAt", "desc"]);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      products: rows.map((model) => this.toDomain(model)),
      total: count,
    };
  }

  async existsByName(
    name: string,
    workspaceId: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      name: { [Op.iLike]: name },
      workspaceId,
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const count = await this.model.count({ where });
    return count > 0;
  }
}
