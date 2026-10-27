import {
  Html,
  Head,
  Preview,
  Tailwind,
  pixelBasedPreset,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";

import type { Movie } from "@/lib/omdb/types";

type MoviePlotTemplateProps = {
  movie: Movie;
};

export const MoviePlotTemplate = ({ movie }: MoviePlotTemplateProps) => {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Preview>The plot for {movie.Title}</Preview>
        <Body className="m-0 bg-[#edf7f0] px-4 py-10 font-sans text-[#173d2a]">
          <Container className="mx-auto w-full max-w-140 rounded-[20px] border border-solid border-[#cfe2d4] bg-[#fbfefc]">
            <Section className="px-6 pb-6 pt-8 sm:px-10">
              <Text className="m-0 text-[15px] leading-6 text-[#2e7548]">
                Hello, user!
              </Text>
              <Text className="mb-2 mt-6 text-[13px] leading-5 text-[#587362]">
                Here is the plot for
              </Text>
              <Heading
                as="h1"
                className="m-0 wrap-break-word font-serif text-[34px] font-normal leading-10 text-[#173d2a]"
              >
                {movie.Title}
              </Heading>
            </Section>
            <Hr className="m-0 border-0 border-t border-solid border-[#cfe2d4]" />
            <Section className="px-6 pb-8 pt-6 sm:px-10">
              <Text className="m-0 wrap-break-word text-[16px] leading-7 text-[#3e5d4b]">
                {movie.Plot}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
