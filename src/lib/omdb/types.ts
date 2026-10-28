import { z } from "zod";

const optionalField = z
  .string()
  .transform((value) =>
    value.trim() === "N/A" ? undefined : value.trim() || undefined,
  )
  .optional();

export const movieSchema = z.object({
  imdbID: z.string(),
  Title: z.string(),
  Plot: optionalField,
});

export const getMovieResponseSchema = z.discriminatedUnion("Response", [
  movieSchema.extend({
    Response: z.literal("True"),
  }),
  z.object({
    Response: z.literal("False"),
    Error: z.string(),
  }),
]);

export type GetMovieRequestParams = {
  movieTitle: string;
};

export type Movie = z.infer<typeof movieSchema>;
