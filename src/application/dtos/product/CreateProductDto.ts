export interface CreateProductDto {
  name: string;
  description?: string;
  color?: string;
  settings?: Record<string, any>;
}
