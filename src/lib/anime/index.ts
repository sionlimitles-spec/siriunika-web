import type { AnimeProvider } from "./types";
import { JikanProvider } from "./jikan";

// Registry provider agar mudah ditambah nanti
const providers: Record<string, () => AnimeProvider> = {
  jikan: () => new JikanProvider(),
};

export function getAnimeProvider(): AnimeProvider {
  const providerName = process.env.ANIME_PROVIDER ?? "jikan";
  const factory = providers[providerName];
  
  if (!factory) {
    console.warn(`Provider "${providerName}" tidak dikenal, fallback ke jikan.`);
    return new JikanProvider();
  }
  
  return factory();
}
