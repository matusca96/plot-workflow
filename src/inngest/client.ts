import { Inngest, eventType } from "inngest";
import { z } from "zod";

export const movieWatchedDataSchema = z.object({
  movie_title: z.string().trim().min(1).max(200),
  recipient_email: z.email().trim().toLowerCase(),
});

export const sendMoviePlotToEmailType = eventType("meadow_api/movie.watched", {
  schema: movieWatchedDataSchema,
});

export const inngest = new Inngest({ id: "plot-movie-workflow" });
