import { afterEach, describe, expect, it, vi } from "vitest";

import { Movie } from "../omdb/types";

import { sendResendMoviePlotEmail } from "./client";

import { ResendApiError } from "./errors";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@/env", () => ({ env: { RESEND_API_KEY: "test-key" } }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const movie = {
  Response: "True",
  Title: "Project Hail Mary",
} as unknown as Movie;

const input = {
  movie,
  recipientEmail: "user@example.com",
  eventId: "evt_123",
};

afterEach(() => send.mockReset());

describe("sendResendMoviePlotEmail", () => {
  it("returns the data on success", async () => {
    send.mockResolvedValue({ data: { id: "email_1" }, error: null });

    await expect(sendResendMoviePlotEmail(input)).resolves.toEqual({
      id: "email_1",
    });
  });

  it("throws ResendApiError preserving the error name and cause", async () => {
    const sdkError = {
      name: "validation_error",
      message: "Invalid `to` field",
    };
    
    send.mockResolvedValue({ data: null, error: sdkError });

    const error = await sendResendMoviePlotEmail(input).catch((e) => e);

    expect(error).toBeInstanceOf(ResendApiError);
    expect(error).toMatchObject({ errorName: "validation_error" });
    expect(error.cause).toBe(sdkError);
  });

  it("sends the prefixed event id as the idempotency key", async () => {
    send.mockResolvedValue({ data: { id: "email_1" }, error: null });
  
    await sendResendMoviePlotEmail(input);
  
    const [, options] = send.mock.calls[0];
  
    expect(options).toMatchObject({ idempotencyKey: "movie-plot/evt_123" });
  });
});
