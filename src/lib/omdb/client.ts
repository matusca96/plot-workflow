import { env } from "@/env";

import { OMDB_BASE_URL } from "./constants";

import { GetMovieRequestParams, getMovieResponseSchema } from "./types";

export const getMovie = async (params: GetMovieRequestParams) => {
  const response = await fetch(
    `${OMDB_BASE_URL}?apikey=${env.OMDB_API_KEY}&t=${params.movieTitle}`,
  );

  const payload: unknown = await response.json();

  const data = getMovieResponseSchema.parse(payload);
  
  return data;
};
