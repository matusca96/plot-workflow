import { inngest, processTaskType } from "@/inngest";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.id || typeof data.id !== "string") {
      return Response.json(
        { message: "id is required and must be a number" },
        { status: 400 },
      );
    }

    await inngest.send(
      processTaskType.create({
        id: data.id,
      }),
    );

    return Response.json({ message: "Event sent" });
  } catch (err) {
    console.error(err);

    return Response.error();
  }
}
