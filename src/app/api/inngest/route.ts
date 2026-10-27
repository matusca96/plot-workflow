import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { sendMoviePlotToEmail } from "@/inngest/sendMoviePlot";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendMoviePlotToEmail],
});
