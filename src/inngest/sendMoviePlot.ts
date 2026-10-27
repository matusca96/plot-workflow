import { NonRetriableError } from "inngest";

import { getMovie } from "@/lib/omdb/client";
import { sendResendMoviePlotEmail } from "@/lib/resend/client";

import { inngest, sendMoviePlotToEmailType } from "./client";
import { permanentOmdbErrors } from "@/lib/omdb/constants";

export const sendMoviePlotToEmail = inngest.createFunction(
  {
    id: "send-movie-plot-to-email",
    triggers: { event: sendMoviePlotToEmailType },
  },
  async ({ event, step, logger }) => {
    const movie = await step.run("fetch-movie", async () => {
      const data = await getMovie({ movieTitle: event.data.movie_title });

      if (data.Response === "False") {
        const message = `OMDb: ${data.Error}`;

        if (permanentOmdbErrors.has(data.Error)) {
          throw new NonRetriableError(message);
        }

        throw new Error(message);
      }

      return data;
    });

    const emailData = await step.run("send-email", async () => {
      const { data, error } = await sendResendMoviePlotEmail({
        movie,
        recipientEmail: event.data.recipient_email,
        eventId: event.id,
      });

      if (error) throw new Error(error.message);

      return data;
    });

    return { movie, emailData };
  },
);
