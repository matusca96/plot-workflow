"use client";

import { SubmitEvent, useState } from "react";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  const pending = state.kind === "pending";

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      movie_title: String(formData.get("movie_title") ?? "").trim(),
      recipient_email: String(formData.get("recipient_email") ?? "").trim(),
    };

    setState({ kind: "pending" });

    try {
      const response = await fetch("/api/send-movie-plot-to-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 202) {
        setState({ kind: "success" });
        return;
      }

      setState({
        kind: "error",
        message:
          response.status === 400
            ? "Please check the movie title and email address, then try again."
            : "We couldn't queue your request. Please try again.",
      });
    } catch {
      setState({
        kind: "error",
        message: "We couldn't connect. Check your connection and try again.",
      });
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#edf7f0] px-5 py-12 text-[#173d2a] sm:px-8 sm:py-16">
      <div className="w-full max-w-120">
        <div className="mb-10 flex items-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-[#2e7548]">
          <span aria-hidden="true" className="h-px w-8 bg-[#3b8755]" />
          PLOT WORKFLOW
        </div>

        <header className="mb-8">
          <p className="mt-5 max-w-95 text-[15px] leading-7 text-[#587362]">
            Enter a movie title and receive the plot in your inbox.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          aria-busy={pending}
          className="rounded-3xl border border-[#cfe2d4] bg-[#fbfefc] p-6 shadow-[0_12px_48px_-24px_#234c3235] sm:p-8"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="movie-title"
                className="mb-2.5 block text-[13px] font-medium"
              >
                Movie title
              </label>
              <input
                id="movie-title"
                name="movie_title"
                type="text"
                placeholder="e.g. Project Hail Mary"
                required
                pattern=".*\S.*"
                title="Enter a movie title."
                disabled={pending}
                className="h-12 w-full rounded-lg border border-[#c9dccf] bg-white px-3.5 text-[15px] text-[#173d2a] outline-none transition placeholder:text-[#8a9f90] focus:border-[#3b8755] focus:ring-3 focus:ring-[#3b8755]/15 disabled:cursor-wait disabled:opacity-60"
              />
            </div>
            <div>
              <label
                htmlFor="recipient-email"
                className="mb-2.5 block text-[13px] font-medium"
              >
                Email address
              </label>
              <input
                id="recipient-email"
                name="recipient_email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                disabled={pending}
                className="h-12 w-full rounded-lg border border-[#c9dccf] bg-white px-3.5 text-[15px] text-[#173d2a] outline-none transition placeholder:text-[#8a9f90] focus:border-[#3b8755] focus:ring-3 focus:ring-[#3b8755]/15 disabled:cursor-wait disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#173d2a] px-4 text-[14px] font-medium text-[#f5fff7] transition hover:bg-[#245639] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3b8755] disabled:cursor-wait disabled:opacity-65"
          >
            {pending ? "Queuing your request..." : "Email me the plot"}
            {!pending && (
              <span aria-hidden="true" className="text-[18px] font-normal">
                ↗
              </span>
            )}
          </button>

          <div
            aria-live="polite"
            aria-atomic="true"
            role="status"
            className={`mt-4 min-h-10 text-[13px] leading-5 ${state.kind === "error" ? "text-[#a23d2c]" : "text-[#587362]"}`}
          >
            {state.kind === "success" &&
              "Your request is queued. We'll email you the plot when it's ready."}
            {state.kind === "error" && state.message}
            {state.kind === "pending" &&
              "Please wait while we queue your request."}
          </div>
        </form>
      </div>
    </main>
  );
}
