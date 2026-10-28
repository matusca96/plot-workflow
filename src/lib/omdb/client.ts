import { env } from "@/env";

import { OMDB_BASE_URL, OMDB_ERROR_KINDS } from "./constants";

import { GetMovieRequestParams, getMovieResponseSchema } from "./types";

import { OmdbApiError, OmdbHttpError, OmdbSchemaError } from "./errors";

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

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (cause) {
    if (!response.ok) throw new OmdbHttpError(response.status, { cause });

    throw new Error(
      `OMDb returned a non-JSON body (status ${response.status})`,
      { cause },
    );
  }

  const parsed = getMovieResponseSchema.safeParse(payload);

  if (!parsed.success) {
    if (!response.ok)
      throw new OmdbHttpError(response.status, { cause: parsed.error });

    throw new OmdbSchemaError(parsed.error.issues, { cause: parsed.error });
  }

  if (parsed.data.Response === "False") {
    const kind = OMDB_ERROR_KINDS[parsed.data.Error] ?? "unknown";

    throw new OmdbApiError(kind, `OMDb: ${parsed.data.Error}`);
  }

  return parsed.data;
};
