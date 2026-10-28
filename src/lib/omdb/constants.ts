import { OmdbApiErrorKind } from "./errors";

export const OMDB_BASE_URL = "https://www.omdbapi.com";

export const OMDB_ERROR_KINDS: Record<string, OmdbApiErrorKind> = {
  "Request limit reached!": "rate_limit",
  "Invalid API key!": "invalid_key",
  "No API key provided.": "missing_key",
  "Incorrect IMDb ID.": "invalid_params",
  "Movie not found!": "not_found",
};