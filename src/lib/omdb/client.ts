import { env } from "@/env";

import { OMDB_BASE_URL } from "./constants";

import { GetMovieRequestParams, getMovieResponseSchema } from "./types";

import { OmdbHttpError } from "./errors";

export const getMovie = async (params: GetMovieRequestParams) => {
  const searchParams = new URLSearchParams({
    apikey: env.OMDB_API_KEY,
    t: params.movieTitle,
  });

  let response: Response;

  try {
    response = await fetch(`${OMDB_BASE_URL}?${searchParams.toString()}`, {
      signal: AbortSignal.timeout(10_000),
    });
  } catch (cause) {
    throw new Error(`OMDb network request failed (${OMDB_BASE_URL})`, {
      cause,
    });
  }

  if (!response.ok) {
    throw new OmdbHttpError(response.status);
  }

  const payload: unknown = await response.json();

  return getMovieResponseSchema.parse(payload);
};
