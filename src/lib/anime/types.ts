export interface AnimeImage {
  imageUrl: string;
  smallImageUrl: string;
  largeImageUrl: string;
}

export interface Anime {
  id: number;
  title: string;
  titleEnglish: string | null;
  synopsis: string | null;
  type: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  score: number | null;
  rank: number | null;
  season: string | null;
  year: number | null;
  genres: string[];
  images: AnimeImage;
  trailerUrl: string | null;
}

export interface Episode {
  id: string; // Kombinasi animeId + episodeNumber untuk kemudahan
  animeId: number;
  number: number;
  title: string | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
  imageUrl: string | null;
}

export interface StreamLink {
  server: string;
  quality: string;
  url: string;
}

export interface AnimeProvider {
  getTrending: () => Promise<Anime[]>;
  getLatest: () => Promise<Anime[]>;
  getSeasonNow: () => Promise<Anime[]>;
  getSchedule: () => Promise<Record<string, Anime[]>>;
  search: (query: string, page?: number, limit?: number) => Promise<Anime[]>;
  getDetail: (id: number) => Promise<Anime | null>;
  getEpisodes: (id: number, page?: number) => Promise<Episode[]>;
  getRecommendations: (id: number) => Promise<Anime[]>;
  getStreamLinks: (episodeId: string) => Promise<StreamLink[]>;
}
