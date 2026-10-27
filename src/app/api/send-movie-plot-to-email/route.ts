import { inngest, sendMoviePlotToEmailType } from "@/inngest/client";

export async function POST() {
  try {
    await inngest.send(
      sendMoviePlotToEmailType.create({
        movie_title: "Batman & Robin",
        recipient_email: "gomesloud@gmail.com"
      }),
    );

    return Response.json({ message: "Event sent" });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Failed to send event" },
      { status: 500 },
    );
  }
}
