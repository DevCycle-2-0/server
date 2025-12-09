import {
  Platform,
  ProductStatus,
} from "@modules/products/domain/entities/Product";

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  ownerId: string;
  ownerName: string;
  status: ProductStatus;
  featuresCount: number;
  bugsCount: number;
  teamMembersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  platforms: Platform[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  platforms?: Platform[];
}

export interface ProductStatsDto {
  totalFeatures: number;
  activeFeatures: number;
  completedFeatures: number;
  openBugs: number;
  resolvedBugs: number;
  activeSprintsCount: number;
  teamMembersCount: number;
  lastActivityAt: string;
}

export interface ProductTeamMemberDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: string;
  joinedAt: string;
}

export interface GetProductsQuery {
  page?: number;
  limit?: number;
  status?: "active" | "archived";
  platform?: string;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
