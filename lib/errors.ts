export enum AppErrorCode {
  Unknown = "UNKNOWN",
  Validation = "VALIDATION",
  NotFound = "NOT_FOUND",
}

export class AppError extends Error {
  readonly code: AppErrorCode
  constructor(message: string, code: AppErrorCode, options?: ErrorOptions) {
    super(message, options)
    this.code = code
  }
}
