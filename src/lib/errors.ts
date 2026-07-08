export enum AppErrorCode {
  Unknown = "UNKNOWN",
  Validation = "VALIDATION",
  NotFound = "NOT_FOUND",
  Conflict = "CONFLICT",
  Unauthorized = "UNAUTHORIZED",
}

export interface ErrorDTO {
  code: AppErrorCode
  message: string
}

export class AppError extends Error {
  readonly code: AppErrorCode
  /**
   * Construct an app error, for use on client & server.
   *
   * @param message - specific error message, should be safe to send to client
   * @param code -  the error code
   * @param options - further error options
   */
  constructor(message: string, code: AppErrorCode, options?: ErrorOptions) {
    super(message, options)
    this.code = code
  }
  /**
   * Convert error into plain object that can be safely sent to client.
   */
  intoDTO(): ErrorDTO {
    return {
      code: this.code,
      message: this.message,
    }
  }
  intoStatusCode(): number {
    switch (this.code) {
      case AppErrorCode.Validation:
        return 400
      case AppErrorCode.NotFound:
        return 404
      case AppErrorCode.Conflict:
        return 409
      case AppErrorCode.Unauthorized:
        return 401
      default:
        return 500
    }
  }
  intoResponse() {
    return Response.json({
      error: this.intoDTO(),
    }, {
      status: this.intoStatusCode(),
      headers: { "Content-Type": "application/x.wikmark.error+json" },
    })
  }
}
