export interface CreateSprintDto {
  name: string;
  goal?: string;
  productId?: string;
  startDate: Date;
  endDate: Date;
  capacityPoints?: number;
}
