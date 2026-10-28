import { getMovie } from "@/lib/omdb/client";

import { sendResendMoviePlotEmail } from "@/lib/resend/client";

import { inngest, sendMoviePlotToEmailType } from "./client";

import { toInngestError } from "./utils";
import { NonRetriableError } from "inngest";

export const sendMoviePlotToEmail = inngest.createFunction(
  {
    id: "send-movie-plot-to-email",
    triggers: { event: sendMoviePlotToEmailType },
    // idempotency: 'event.data.movie_title + ":" + event.data.recipient_email',
    rateLimit: {
      limit: 1,
      period: "1m",
      key: 'event.data.movie_title + ":" + event.data.recipient_email',
    },
  },
  async ({ event, step }) => {
    const movie = await step.run("fetch-movie", async () => {
      try {
        const result = await getMovie({ movieTitle: event.data.movie_title });

        if (!result.Plot) {
          throw new NonRetriableError(
            `OMDb: no plot available for "${result.Title}"`,
          );
        }

        return result;
      } catch (error) {
        throw toInngestError(error);
      }
    });

    const emailData = await step.run("send-email", async () => {
      try {
        return await sendResendMoviePlotEmail({
          movie,
          recipientEmail: event.data.recipient_email,
          eventId: event.id,
        });
      } catch (error) {
        throw toInngestError(error);
      }
    });

    return { movie, emailData };
  },
);
