import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";

export type Platform = "web" | "android" | "ios" | "api" | "desktop";
export type ProductStatus = "active" | "archived";

interface ProductProps {
  name: string;
  description: string;
  platforms: Platform[];
  ownerId: string;
  ownerName: string;
  status: ProductStatus;
  featuresCount: number;
  bugsCount: number;
  teamMembersCount: number;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends AggregateRoot<ProductProps> {
  private constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get platforms(): Platform[] {
    return this.props.platforms;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get ownerName(): string {
    return this.props.ownerName;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get featuresCount(): number {
    return this.props.featuresCount;
  }

  get bugsCount(): number {
    return this.props.bugsCount;
  }

  get teamMembersCount(): number {
    return this.props.teamMembersCount;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(
    name?: string,
    description?: string,
    platforms?: Platform[]
  ): void {
    if (name) this.props.name = name;
    if (description !== undefined) this.props.description = description;
    if (platforms) this.props.platforms = platforms;
    this.props.updatedAt = new Date();
  }

  public archive(): void {
    this.props.status = "archived";
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.status = "active";
    this.props.updatedAt = new Date();
  }

  public updateCounts(
    features: number,
    bugs: number,
    teamMembers: number
  ): void {
    this.props.featuresCount = features;
    this.props.bugsCount = bugs;
    this.props.teamMembersCount = teamMembers;
  }

  public static create(
    props: {
      name: string;
      description: string;
      platforms: Platform[];
      ownerId: string;
      ownerName: string;
      workspaceId: string;
      status?: ProductStatus;
      featuresCount?: number;
      bugsCount?: number;
      teamMembersCount?: number;
    },
    id?: string
  ): Product {
    return new Product(
      {
        name: props.name,
        description: props.description,
        platforms: props.platforms,
        ownerId: props.ownerId,
        ownerName: props.ownerName,
        workspaceId: props.workspaceId,
        status: props.status || "active",
        featuresCount: props.featuresCount || 0,
        bugsCount: props.bugsCount || 0,
        teamMembersCount: props.teamMembersCount || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
