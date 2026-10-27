import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "plot-workflow" });

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" }, retries: 2 },
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
