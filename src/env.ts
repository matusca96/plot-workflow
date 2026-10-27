import { z } from "zod";

export const env = z
  .object({
    OMDB_API_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    RESEND_FROM_EMAIL: z.email().optional().default("onboarding@resend.dev"),
  })
  .parse(process.env);
