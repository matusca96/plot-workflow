import { Resend } from "resend";

import { env } from "@/env";

import { MoviePlotTemplate } from "@/components/email-templates/MoviePlotTemplate";

import { SendResendMoviePlotEmailParams } from "./types";

import { ResendApiError } from "./errors";

const resend = new Resend(env.RESEND_API_KEY);

export const sendResendMoviePlotEmail = async ({
  movie,
  recipientEmail,
  eventId,
}: SendResendMoviePlotEmailParams) => {
  const { data, error } = await resend.emails.send(
    {
      from: `Movie Plot <${env.RESEND_FROM_EMAIL}>`,
      to: [recipientEmail],
      subject: "Here is your movie plot!",
      react: MoviePlotTemplate({ movie }),
    },
    {
      idempotencyKey: `movie-plot/${eventId}`,
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (error) {
    throw new ResendApiError(error.name, error.message, { cause: error });
  }

  return data;
};
