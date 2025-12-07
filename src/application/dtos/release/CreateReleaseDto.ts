export interface CreateReleaseDto {
  version: string;
  name?: string;
  description?: string;
  releaseType: string;
  productId?: string;
  targetDate?: Date;
  pipelineConfig?: Record<string, any>;
}
