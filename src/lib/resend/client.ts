import { Resend } from "resend";

import { env } from "@/env";

import { Movie } from "@/lib/omdb/types";

import { MoviePlotTemplate } from "@/components/email-templates/MoviePlotTemplate";


const resend = new Resend(env.RESEND_API_KEY);

export const sendResendMoviePlotEmail = async (movie: Movie) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["delivered@resend.dev"],
    subject: "Here is your movie plot!",
    react: MoviePlotTemplate({ movie }),
  });

  return { data, error };
};
