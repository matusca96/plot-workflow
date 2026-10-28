# Plot workflow

A Next.js app that emails a movie's plot using OMDb, Inngest, and Resend.
The [Inngest function](src/inngest/sendMoviePlot.ts) handles `meadow_api/movie.watched` events in separate `fetch-movie` and `send-email` steps.

## Setup

Use Node.js 24 and pnpm 12.15.0. You need an OMDb API key and a Resend API key.

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Create `.env.local` with your credentials:

   ```dotenv
   OMDB_API_KEY=your_omdb_api_key
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

   With `onboarding@resend.dev`, use the email address associated with your Resend account as the recipient. To send to other recipients, set `RESEND_FROM_EMAIL` to an address on a [verified domain](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

3. Start Next.js:

   ```sh
   INNGEST_DEV=1 pnpm dev
   ```

4. In another terminal, start the [Inngest Dev Server](https://www.inngest.com/docs/local-development):

   ```sh
   npx --ignore-scripts=false inngest-cli@latest dev --no-discovery -u http://localhost:3000/api/inngest

   # pnpm
   pnpm dlx inngest-cli@latest dev -u http://localhost:3000/api/inngest 
   ```

   If Next.js uses another port, update the URL above.

5. Open [localhost:3000](http://localhost:3000), enter a movie title and recipient email, and submit the form. Inspect the run and its steps at [localhost:8288](http://localhost:8288). You can also run through Inngest UI or use any HTTP client to call `POST /api/send-movie-plot-to-email`.

The form calls `POST /api/send-movie-plot-to-email`, which validates the input and sends the event.

Run `pnpm typecheck` to check TypeScript.

Run `pnpm test` to run the unit tests (Vitest).

## Assumptions & Improvements

- OMDb always return a single movie when querying with `t` param even when the query is incomplete.
- OMDb reports most failures as a valid JSON payload (`Response: "False"` + `Error`), and the HTTP status is not reliable (for example, 401 can mean either a missing key or the request limit). The client therefore maps the `Error` message via `OMDB_ERROR_KINDS` instead of branching on status. Messages observed while testing the API (it has no error documentation):
  - `Movie not found!` (200)
  - `Invalid API key!` / `No API key provided.` (401)
  - `Incorrect IMDb ID.` when no query param besides `apikey` is sent (200)
  - `Request limit reached!` when the daily limit is hit (401)
- OMDb returns `N/A` for missing fields. A movie without a plot stops the workflow with a non-retriable error and no email is sent.
- For Resend was also mapped few scenarios where the workflow stops and don't retry sending the email, check `NON_RETRIABLE_RESEND_ERRORS`
- Resend uses the event ID as an idempotency key. Duplicate protection applies to the same key and payload within its 24-hour retention window (https://resend.com/changelog/idempotency-keys).
- Function runs are limited to one start per minute for each movie title + recipient email combination. Excess runs are skipped rather than queued for later.

## Error handling

Errors are grouped by what happened, and the retry decision lives in one place: `toInngestError` ([src/inngest/errors.ts](src/inngest/utils.ts)).

| Failure | Error | Inngest outcome |
| --- | --- | --- |
| OMDb daily limit reached | `OmdbApiError` (`rate_limit`) | `RetryAfterError` (1h) |
| Invalid/missing API key, movie not found, incorrect IMDb ID | `OmdbApiError` | `NonRetriableError` |
| Movie found with a missing, blank, or `N/A` plot | `NonRetriableError` | No retry or email |
| OMDb payload outside the expected schema | `OmdbSchemaError` | `NonRetriableError` |
| Network failure, timeout, 5xx, non-JSON body | `OmdbHttpError` / `Error` | Default retry |
| OMDb message not in `OMDB_ERROR_KINDS` | `OmdbApiError` (`unknown`) | Default retry |
| Resend error in `NON_RETRIABLE_RESEND_ERRORS` | `ResendApiError` | `NonRetriableError` |
| Any other Resend error | `ResendApiError` | Default retry |

The `switch` over `OmdbApiError` kinds is exhaustive: adding a kind without handling it fails type checking.

## Tests

- `getMovie`: maps each OMDb error message to its kind (including the 401 + `Request limit reached!` regression), and covers schema violations, 5xx responses and network failures.
- `toInngestError`: the full retry policy (which errors are retried, delayed, or stopped).
- Resend client: error mapping and the event-based idempotency key.

The Inngest function itself (step wiring and retries) is not covered by automated tests.

## Limitations

- HTTP `202` confirms that Inngest received the event. Movie lookup, plot validation, and email sending happen asynchronously, so the initial response cannot report their outcome. The `inngest.send()` response also does not report the function's rate-limit decision. The UI displays "Request received" and warns that repeat requests for the same movie and email within one minute may be skipped. An always-visible notice on the form explains that no email is sent if the movie has no available plot. The endpoint does not return `429` for this function-level limit.
- Function-level idempotency based on movie title and recipient is disabled. Otherwise, a failed run would prevent new event-triggered runs for that combination during the 24-hour deduplication window. Resend uses an event-based idempotency key to protect email-step retries against duplicate sends. New requests remain subject to the movie-title + recipient email rate limit.
- OMDb error messages are matched by exact string and are not documented by the provider. If a message changes, it degrades to the default retry instead of stopping the workflow.
- `Request limit reached!` is a daily limit, so a 1h retry may exhaust the function's retry budget before the limit resets, in which case the run fails.

## Recommendation for the exercise

Add explicit scenarios and expected outcomes for invalid or nonexistent movie titles, including misspellings, ambiguous titles, and missing plots. Clarify whether the workflow should stop, notify the recipient, or request another title.
