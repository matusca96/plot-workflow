import { Movie } from "@/lib/omdb/types";

type MoviePlotTemplateProps = {
  movie: Movie;
};

export const MoviePlotTemplate = ({ movie }: MoviePlotTemplateProps) => {
  return (
    <div>
      <h1>Hello, user! Here is the plot for the movie {movie.Title}:</h1>
      <p>{movie.Plot}</p>
    </div>
  );
};
