import { Inngest, eventType } from "inngest";
import { z } from "zod";

export const sendMoviePlotToEmailType = eventType("meadow_api/movie.watched", {
  schema: z.object({
    movie_title: z.string(),
    recipient_email: z.email(),
  }),
});

export const inngest = new Inngest({ id: "plot-movie-workflow" });
