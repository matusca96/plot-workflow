import {
  inngest,
  movieWatchedDataSchema,
  sendMoviePlotToEmailType,
} from "@/inngest/client";

export const POST = async (request: Request) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "We couldn't read your request. Please try again." },
      { status: 400 },
    );
  }

  const result = movieWatchedDataSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Please enter a movie title and a valid email address." },
      { status: 400 },
    );
  }

  try {
    await inngest.send(sendMoviePlotToEmailType.create(result.data));

    return Response.json(
      { message: "Movie plot request received" },
      { status: 202 },
    );
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "We couldn't submit your request. Please try again." },
      { status: 500 },
    );
  }
};
