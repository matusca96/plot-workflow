import { env } from "@/env";

import { OMDB_BASE_URL } from "./constants";

import { GetMovieRequestParams, getMovieResponseSchema } from "./types";

export const getMovie = async (params: GetMovieRequestParams) => {
  const searchParams = new URLSearchParams({
    apikey: env.OMDB_API_KEY,
    t: params.movieTitle,
  });

  try {
    const response = await fetch(`${OMDB_BASE_URL}?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error(`OMDb request failed: HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();

    const data = getMovieResponseSchema.parse(payload);

    return data;
  } catch (cause) {
    throw new Error(`OMDb network request failed (${OMDB_BASE_URL})`, {
      cause,
    });
  }
};
