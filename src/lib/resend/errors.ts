export class ResendApiError extends Error {
  constructor(
    readonly errorName: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(`Resend (${errorName}): ${message}`, options);
  }
}