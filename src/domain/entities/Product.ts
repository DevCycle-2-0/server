export class Product {
  constructor(
    public id: string,
    public workspaceId: string,
    public name: string,
    public description?: string,
    public logoUrl?: string,
    public color: string = "#6366F1",
    public status: string = "active",
    public settings: Record<string, any> = {},
    public createdBy?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    workspaceId: string,
    name: string,
    createdBy: string,
    description?: string
  ): Product {
    return new Product(
      id,
      workspaceId,
      name,
      description,
      undefined,
      "#6366F1",
      "active",
      {},
      createdBy
    );
  }

  update(data: {
    name?: string;
    description?: string;
    color?: string;
    status?: string;
    settings?: Record<string, any>;
  }): void {
    if (data.name) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.color) this.color = data.color;
    if (data.status) this.status = data.status;
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
    }
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = "archived";
    this.updatedAt = new Date();
  }
}
