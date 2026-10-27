export const NON_RETRIABLE_RESEND_ERRORS = new Set([
  "validation_error",
  "invalid_from_address",
  "invalid_attachment",
  "invalid_parameter",
  "missing_api_key",
  "invalid_api_key",
  "restricted_api_key",
  "invalid_idempotency_key",
  "invalid_idempotent_request",
]);