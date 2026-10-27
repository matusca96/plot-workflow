import { NonRetriableError } from "inngest";

import { getMovie } from "@/lib/omdb/client";
import { permanentOmdbErrors } from "@/lib/omdb/constants";
import { OmdbHttpError } from "@/lib/omdb/errors";
import { sendResendMoviePlotEmail } from "@/lib/resend/client";

import { inngest, sendMoviePlotToEmailType } from "./client";

export const sendMoviePlotToEmail = inngest.createFunction(
  {
    id: "send-movie-plot-to-email",
    triggers: { event: sendMoviePlotToEmailType },
  },
  async ({ event, step }) => {
    const movie = await step.run("fetch-movie", async () => {
      try {
        const data = await getMovie({
          movieTitle: event.data.movie_title,
        });

        if (data.Response === "False") {
          const message = `OMDb: ${data.Error}`;

          if (permanentOmdbErrors.has(data.Error)) {
            throw new NonRetriableError(message);
          }

          throw new Error(message);
        }

        return data;
      } catch (error) {
        if (error instanceof OmdbHttpError && error.status === 401) {
          throw new NonRetriableError(
            "OMDb: missing or invalid API key (HTTP 401)",
            { cause: error },
          );
        }

        throw error;
      }
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
