import { z } from "zod";

export type OmdbApiErrorKind =
  | "rate_limit"
  | "missing_key"
  | "invalid_key"
  | "missing_params"
  | "not_found"
  | "unknown";

export class OmdbApiError extends Error {
  constructor(
    readonly kind: OmdbApiErrorKind,
    message: string,
  ) {
    super(message);
  }
}

export class OmdbSchemaError extends Error {
  constructor(
    readonly issues: z.core.$ZodIssue[],
    options?: ErrorOptions,
  ) {
    super("OMDb: unexpected response shape", options);
  }
}

export class OmdbHttpError extends Error {
  constructor(
    readonly status: number,
    options?: ErrorOptions,
  ) {
    super(`OMDb request failed: HTTP ${status}`, options);
  }
}
