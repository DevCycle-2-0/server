export interface UpdateReleaseDto {
  name?: string;
  description?: string | null;
  targetDate?: Date | null;
  releaseNotes?: string;
  pipelineConfig?: Record<string, any>;
}
