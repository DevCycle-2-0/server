export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new AppError(400, "VALIDATION_ERROR", message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(401, "AUTH_UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(403, "AUTH_FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, "RESOURCE_NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new AppError(409, "DUPLICATE_RESOURCE", message);
  }

  static internal(message = "Internal server error") {
    return new AppError(500, "INTERNAL_ERROR", message);
  }
}
