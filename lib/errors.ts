export enum AppErrorCode {
  Unknown = "UNKNOWN",
  Validation = "VALIDATION",
  NotFound = "NOT_FOUND",
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
}
