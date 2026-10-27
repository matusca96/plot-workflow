export class OmdbHttpError extends Error {
  constructor(public readonly status: number) {
    super(`OMDb request failed: HTTP ${status}`);

    this.name = "OmdbHttpError";
  }
}

export class OmdbSchemaError extends Error {
  constructor(public readonly issues: unknown, options?: ErrorOptions) {
    super("OMDb: unexpected response shape", options);
    this.name = "OmdbSchemaError";
  }
}