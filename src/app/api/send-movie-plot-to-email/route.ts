import { inngest, sendMoviePlotToEmailType } from "@/inngest/client";

export async function POST() {
  try {
    await inngest.send(
      sendMoviePlotToEmailType.create({
        movie_title: "Avengers",
        recipient_email: "gomesloud@gmail.com"
      }),
    );

    return Response.json({ message: "Event sent" });
  } catch (err) {
    console.error(err);

    return Response.error();
  }
}
