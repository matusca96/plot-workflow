import { NonRetriableError, RetryAfterError } from "inngest";

import { OmdbApiError, OmdbSchemaError } from "@/lib/omdb/errors";

import { ResendApiError } from "@/lib/resend/errors";
import { NON_RETRIABLE_RESEND_ERRORS } from "@/lib/resend/constants";

const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${String(value)}`);
};

export const toInngestError = (error: unknown) => {
  if (error instanceof ResendApiError) {
    return NON_RETRIABLE_RESEND_ERRORS.has(error.errorName)
      ? new NonRetriableError(error.message, { cause: error })
      : error;
  }

  if (error instanceof OmdbApiError) {
    switch (error.kind) {
      case "rate_limit":
        return new RetryAfterError(error.message, "1h", { cause: error });
      case "missing_key":
      case "invalid_key":
      case "missing_params":
      case "not_found":
        return new NonRetriableError(error.message, { cause: error });
      case "unknown":
        return error;
      default:
        return assertNever(error.kind);
    }
  }
  

  if (error instanceof OmdbSchemaError) {
    return new NonRetriableError(error.message, { cause: error });
  }

  return error;
};
