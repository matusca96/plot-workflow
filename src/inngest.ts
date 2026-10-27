import { Inngest, eventType } from "inngest";
import { z } from "zod";

export const inngest = new Inngest({ id: "plot-movie-workflow" });

export const processTaskType = eventType("app/task.created", {
  schema: z.object({
    id: z.string()
  })
})

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: processTaskType }, retries: 2 },
  async ({ event, step }) => {
    const result = await step.run("handle-task", () => {
      return { processed: true, id: event.data.id };
    });

    await step.sleep("pause", "1s");

    // force retry for testing
    // if (event.data.id === "retry-demo") throw new Error("Temporary failure");

    return { message: `Task ${event.data.id} complete`, result };
  }
);
