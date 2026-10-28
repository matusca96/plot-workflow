import { NonRetriableError, RetryAfterError } from "inngest";
import { describe, expect, it } from "vitest";

import { OmdbApiError, OmdbHttpError, OmdbSchemaError } from "@/lib/omdb/errors";
import { ResendApiError } from "@/lib/resend/errors";
import { NON_RETRIABLE_RESEND_ERRORS } from "@/lib/resend/constants";

import { toInngestError } from "./utils";

const nonRetriableResendName = [...NON_RETRIABLE_RESEND_ERRORS][0];

describe("toInngestError", () => {
  it("maps rate_limit to RetryAfterError", () => {
    const result = toInngestError(new OmdbApiError("rate_limit", "limit"));

    expect(result).toBeInstanceOf(RetryAfterError);
  });

  it.each(["missing_key", "invalid_key", "invalid_params", "not_found"] as const)(
    "maps %s to NonRetriableError",
    (kind) => {
      expect(toInngestError(new OmdbApiError(kind, "x"))).toBeInstanceOf(
        NonRetriableError,
      );
    },
  );

  it("maps OmdbSchemaError to NonRetriableError", () => {
    expect(toInngestError(new OmdbSchemaError([]))).toBeInstanceOf(
      NonRetriableError,
    );
  });

  it("maps non-retriable Resend errors to NonRetriableError", () => {
    const error = new ResendApiError(nonRetriableResendName, "x");
    expect(toInngestError(error)).toBeInstanceOf(NonRetriableError);
  });

  it.each([
    ["OMDb unknown error", new OmdbApiError("unknown", "x")],
    ["OmdbHttpError", new OmdbHttpError(502)],
    ["network error", new TypeError("fetch failed")],
    ["retriable Resend error", new ResendApiError("rate_limit_exceeded", "x")],
  ])("passes through %s unchanged (default retry)", (_, error) => {
    expect(toInngestError(error)).toBe(error);
  });
});