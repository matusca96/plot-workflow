import { OMDB_BASE_URL } from "@/lib/omdb/constants";
import { inngest, sendMoviePlotToEmailType } from "./client";
import { getMovie } from "@/lib/omdb/client";

export const sendMoviePlotToEmail = inngest.createFunction(
  {
    id: "send-movie-plot-to-email",
    triggers: { event: sendMoviePlotToEmailType },
  },
  async ({ event, step }) => {
    const movie = await step.run("fetch-movie", async () =>
      getMovie({ movieTitle: event.data.movie_title }),
    );

    return { movie };
  },
);
