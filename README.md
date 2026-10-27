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

The form calls `POST /api/send-movie-plot-to-email`, which validates the input and sends the event. Run `pnpm typecheck` to check TypeScript.

## Assumptions

- OMDb always return a single movie when querying with `t` param even when the query is incomplete.
- Few scenarios stops the workflow without sending an email, after testing OMDb api a bit, I've found:
   - `Movie not found!` when no movie is found (200)
   - `Invalid API key!` or `No API key provided.` when invalid API key or none provided (401)
   - `Incorrect IMDb ID.` when no query param besides `apikey` is provided (200)
- Resend uses the event ID as an idempotency key. Duplicate protection applies to the same key and payload within its 24-hour retention window (https://resend.com/changelog/idempotency-keys).

## Recommendation for the exercise

Add explicit scenarios and expected outcomes for invalid or nonexistent movie titles, including misspellings, ambiguous titles, and missing plots. Clarify whether the workflow should stop, notify the recipient, or request another title.
