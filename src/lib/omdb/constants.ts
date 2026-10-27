export const OMDB_BASE_URL = "https://www.omdbapi.co";

export const NON_RETRIABLE_OMDB_ERRORS = new Set([
  "Movie not found!",
  "Incorrect IMDb ID.",
]);

export const OMDB_RATE_LIMIT_ERROR = "Request limit reached!";
