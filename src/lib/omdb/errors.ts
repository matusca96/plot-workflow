export class OmdbHttpError extends Error {
  constructor(public readonly status: number) {
    super(`OMDb request failed: HTTP ${status}`);

    this.name = "OmdbHttpError";
  }
}
