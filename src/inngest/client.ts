import { Inngest, eventType } from "inngest";
import { z } from "zod";

export const movieWatchedDataSchema = z.object({
  movie_title: z.string().trim().min(1, "Movie title is required."),
  recipient_email: z.email(),
});

export const sendMoviePlotToEmailType = eventType("meadow_api/movie.watched", {
  schema: movieWatchedDataSchema,
});

export const inngest = new Inngest({ id: "plot-movie-workflow" });
