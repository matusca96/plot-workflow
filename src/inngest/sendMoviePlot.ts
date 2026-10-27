import { NonRetriableError } from "inngest";

import { getMovie } from "@/lib/omdb/client";
import { sendResendMoviePlotEmail } from "@/lib/resend/client";

import { inngest, sendMoviePlotToEmailType } from "./client";

export const sendMoviePlotToEmail = inngest.createFunction(
  {
    id: "send-movie-plot-to-email",
    triggers: { event: sendMoviePlotToEmailType },
  },
  async ({ event, step }) => {
    const movie = await step.run("fetch-movie", async () => {
      const data = await getMovie({ movieTitle: event.data.movie_title });

      if (data.Response === "False") {
        throw new NonRetriableError("Movie does not exist");
      }

      return data;
    });

    const emailData = await step.run("send-email", async () => {
      const { data, error } = await sendResendMoviePlotEmail(movie);

      if (error) throw new Error(error.message);

      return data;
    });

    return { movie, emailData };
  },
);
