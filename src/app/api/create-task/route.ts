import { inngest } from "@/inngest";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.id) {
      return Response.json({ message: "id is required" }, { status: 400 })
    }

    await inngest.send({
      name: "app/task.created",
      data: { id: data.id },
    });

    return Response.json({ message: "Event sent" });
  } catch (err) {
    console.error(err);

    return Response.error();
  }
}
