import { NonRetriableError, RetryAfterError } from "inngest";

import { getMovie } from "@/lib/omdb/client";

import {
  NON_RETRIABLE_OMDB_ERRORS,
  OMDB_RATE_LIMIT_ERROR,
} from "@/lib/omdb/constants";
import { OmdbHttpError, OmdbSchemaError } from "@/lib/omdb/errors";

import { sendResendMoviePlotEmail } from "@/lib/resend/client";
import { NON_RETRIABLE_RESEND_ERRORS } from "@/lib/resend/constants";

import { inngest, sendMoviePlotToEmailType } from "./client";

export const sendMoviePlotToEmail = inngest.createFunction(
  {
    id: "send-movie-plot-to-email",
    triggers: { event: sendMoviePlotToEmailType },
    // idempotency: 'event.data.movie_title + ":" + event.data.recipient_email',
    rateLimit: {
      limit: 5,
      period: "1h",
      key: "event.data.recipient_email",
    },
  },
  async ({ event, step }) => {
    const movie = await step.run("fetch-movie", async () => {
      try {
        const data = await getMovie({
          movieTitle: event.data.movie_title,
        });

        if (data.Response === "False") {
          const message = `OMDb: ${data.Error}`;

          if (data.Error === OMDB_RATE_LIMIT_ERROR) {
            throw new RetryAfterError(message, "1h");
          }

          if (NON_RETRIABLE_OMDB_ERRORS.has(data.Error)) {
            throw new NonRetriableError(message);
          }

          throw new Error(message);
        }

        return data;
      } catch (error) {
        if (error instanceof OmdbSchemaError) {
          throw new NonRetriableError(error.message, { cause: error });
        }
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

      if (error) {
        const message = `Resend (${error.name}): ${error.message}`;

        if (NON_RETRIABLE_RESEND_ERRORS.has(error.name)) {
          throw new NonRetriableError(message, { cause: error });
        }

        throw new Error(message, { cause: error });
      }

      return data;
    });

    return { movie, emailData };
  },
);
