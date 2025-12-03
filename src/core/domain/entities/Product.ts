import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum ProductStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

export enum PlatformType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
  DASHBOARD = 'dashboard',
  BACKEND = 'backend',
  API = 'api',
}

interface ProductProps {
  workspaceId: string;
  name: string;
  description?: string;
  platform: PlatformType;
  version?: string;
  status: ProductStatus;
  icon?: string;
  settings: Record<string, any>;
}

export class Product extends BaseEntity<ProductProps> {
  private constructor(id: string, private props: ProductProps, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    name: string,
    platform: PlatformType,
    description?: string,
    id?: string
  ): Product {
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Product name must be at least 3 characters long');
    }

    if (!Object.values(PlatformType).includes(platform)) {
      throw new ValidationError(`Invalid platform type: ${platform}`);
    }

    return new Product(id || crypto.randomUUID(), {
      workspaceId,
      name: name.trim(),
      description: description?.trim(),
      platform,
      status: ProductStatus.ACTIVE,
      settings: {},
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    name: string,
    description: string | null,
    platform: PlatformType,
    version: string | null,
    status: ProductStatus,
    icon: string | null,
    settings: Record<string, any>,
    createdAt: Date,
    updatedAt: Date
  ): Product {
    return new Product(
      id,
      {
        workspaceId,
        name,
        description: description || undefined,
        platform,
        version: version || undefined,
        status,
        icon: icon || undefined,
        settings,
      },
      createdAt,
      updatedAt
    );
  }

  update(data: { name?: string; description?: string; version?: string; icon?: string }): void {
    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new ValidationError('Product name must be at least 3 characters long');
      }
      this.props.name = data.name.trim();
    }

    if (data.description !== undefined) {
      this.props.description = data.description.trim() || undefined;
    }

    if (data.version !== undefined) {
      this.props.version = data.version;
    }

    if (data.icon !== undefined) {
      this.props.icon = data.icon;
    }

    this.touch();
  }

  changeStatus(status: ProductStatus): void {
    if (!Object.values(ProductStatus).includes(status)) {
      throw new ValidationError(`Invalid product status: ${status}`);
    }
    this.props.status = status;
    this.touch();
  }

  archive(): void {
    this.props.status = ProductStatus.ARCHIVED;
    this.touch();
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get platform(): PlatformType {
    return this.props.platform;
  }
  get version(): string | undefined {
    return this.props.version;
  }
  get status(): ProductStatus {
    return this.props.status;
  }
  get icon(): string | undefined {
    return this.props.icon;
  }
  get settings(): Record<string, any> {
    return { ...this.props.settings };
  }

  isActive(): boolean {
    return this.props.status === ProductStatus.ACTIVE;
  }
}
