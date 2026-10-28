import { afterEach, describe, expect, it, vi } from "vitest";

import { getMovie } from "./client";

import { OmdbApiError, OmdbHttpError, OmdbSchemaError } from "./errors";

vi.mock("@/env", () => ({ env: { OMDB_API_KEY: "test-key" } }));

const validMovie = {
  Response: "True",
  Title: "Project Hail Mary",
  Plot: "Project Hail Mary fake plot",
  imdbID: "fake-imdb-id",
};

const mockFetch = (body: string, status = 200) =>
  vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => new Response(body, { status }));

const mockJson = (body: unknown, status = 200) =>
  mockFetch(JSON.stringify(body), status);

afterEach(() => vi.restoreAllMocks());

describe("getMovie", () => {
  it("returns the movie on success", async () => {
    mockJson(validMovie);

    await expect(
      getMovie({ movieTitle: "Project Hail Mary" }),
    ).resolves.toMatchObject({
      Title: "Project Hail Mary",
    });
  });

  it("maps 401 + 'Request limit reached!' to rate_limit", async () => {
    mockJson({ Response: "False", Error: "Request limit reached!" }, 401);

    const error = await getMovie({ movieTitle: "x" }).catch((e) => e);

    expect(error).toBeInstanceOf(OmdbApiError);
    expect(error).toMatchObject({ kind: "rate_limit" });
  });

  it("maps 'No API key provided.' to missing_key", async () => {
    mockJson({ Response: "False", Error: "No API key provided." }, 401);

    await expect(getMovie({ movieTitle: "x" })).rejects.toMatchObject({
      kind: "missing_key",
    });
  });


  it("maps 'Invalid API key!' to invalid_key", async () => {
    mockJson({ Response: "False", Error: "Invalid API key!" }, 401);

    await expect(getMovie({ movieTitle: "x" })).rejects.toMatchObject({
      kind: "invalid_key",
    });
  });

  it("maps 'Movie not found!' (HTTP 200) to not_found", async () => {
    mockJson({ Response: "False", Error: "Movie not found!" });

    await expect(getMovie({ movieTitle: "x" })).rejects.toMatchObject({
      kind: "not_found",
    });
  });

  it("maps 'Incorrect IMDb ID.' (HTTP 200) to invalid_params", async () => {
    mockJson({ Response: "False", Error: "Incorrect IMDb ID." });

    await expect(getMovie({ movieTitle: "x" })).rejects.toMatchObject({
      kind: "invalid_params",
    });
  });

  it("uses kind 'unknown' for unmapped messages", async () => {
    mockJson({ Response: "False", Error: "Something new!" });

    await expect(getMovie({ movieTitle: "x" })).rejects.toMatchObject({
      kind: "unknown",
    });
  });

  it("throws OmdbSchemaError for an off-contract payload (200)", async () => {
    mockJson({ foo: "bar" });

    await expect(getMovie({ movieTitle: "x" })).rejects.toBeInstanceOf(
      OmdbSchemaError,
    );
  });

  it("throws OmdbHttpError for a 5xx with an HTML body", async () => {
    mockFetch("<html>Bad Gateway</html>", 502);

    await expect(getMovie({ movieTitle: "x" })).rejects.toMatchObject({
      status: 502,
    });
    await expect(getMovie({ movieTitle: "x" })).rejects.toBeInstanceOf(
      OmdbHttpError,
    );
  });

  it("throws OmdbHttpError for a 5xx with off-schema JSON", async () => {
    mockJson({ message: "internal" }, 500);

    await expect(getMovie({ movieTitle: "x" })).rejects.toBeInstanceOf(
      OmdbHttpError,
    );
  });

  it("treats a 200 with a non-JSON body as a generic (transient) Error, not a schema error", async () => {
    mockFetch("<html>proxy page</html>", 200);
    
    const error = await getMovie({ movieTitle: "x" }).catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(OmdbHttpError);
    expect(error).not.toBeInstanceOf(OmdbSchemaError);
  });

  it("propagates network failures as an Error with cause", async () => {
    const cause = new TypeError("fetch failed");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(cause);

    await expect(getMovie({ movieTitle: "x" })).rejects.toMatchObject({
      cause,
    });
  });

  it("sends apikey and t in the query string", async () => {
    const spy = mockJson(validMovie);
  
    await getMovie({ movieTitle: "Project Hail Mary" });
  
    const url = new URL(String(spy.mock.calls[0][0]));

    expect(url.searchParams.get("apikey")).toBe("test-key");
    expect(url.searchParams.get("t")).toBe("Project Hail Mary");
  });
});
