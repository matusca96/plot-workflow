import { Movie } from "../omdb/types";

export type SendResendMoviePlotEmailParams = {
  movie: Movie;
  recipientEmail: string;
  eventId: string;
};
