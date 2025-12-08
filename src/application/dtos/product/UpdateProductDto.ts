export interface UpdateProductDto {
  name?: string;
  description?: string | null;
  color?: string;
  status?: string;
  settings?: Record<string, any>;
}
