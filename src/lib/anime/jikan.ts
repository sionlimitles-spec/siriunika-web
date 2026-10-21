import type {
  Anime,
  AnimeProvider,
  Episode,
  StreamLink,
} from "./types";

const BASE_URL = "https://api.jikan.moe/v4";

// Helper untuk fetch dengan timeout dan retry (backoff)
async function fetchWithRetry<T>(
  url: string,
  retries = 2,
  timeout = 8000,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (res.status === 429 && attempt < retries) {
        // Rate limit Jikan (3 req/sec), tunggu sebentar
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      if (!res.ok) {
        throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(id);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error("Unreachable");
}

// Mapper dari struktur Jikan ke struktur internal kita
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAnime(data: any): Anime {
  return {
    id: data.mal_id,
    title: data.title,
    titleEnglish: data.title_english ?? null,
    synopsis: data.synopsis ?? null,
    type: data.type ?? "Unknown",
    episodes: data.episodes ?? null,
    status: data.status ?? "Unknown",
    airing: data.airing ?? false,
    score: data.score ?? null,
    rank: data.rank ?? null,
    season: data.season ?? null,
    year: data.year ?? null,
    genres: (data.genres ?? []).map((g: { name: string }) => g.name),
    images: {
      imageUrl: data.images?.jpg?.image_url ?? "",
      smallImageUrl: data.images?.jpg?.small_image_url ?? "",
      largeImageUrl: data.images?.jpg?.large_image_url ?? "",
    },
    trailerUrl: data.trailer?.url ?? null,
  };
}

export class JikanProvider implements AnimeProvider {
  async getTrending(): Promise<Anime[]> {
    const data = await fetchWithRetry<{ data: any[] }>(
      `${BASE_URL}/top/anime?filter=airing&limit=12`,
    );
    return data.data.map(mapAnime);
  }

  async getLatest(): Promise<Anime[]> {
    const data = await fetchWithRetry<{ data: any[] }>(
      `${BASE_URL}/seasons/now?limit=12`,
    );
    return data.data.map(mapAnime);
  }

  async getSeasonNow(): Promise<Anime[]> {
    return this.getLatest();
  }

  async getSchedule(): Promise<Record<string, Anime[]>> {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const schedule: Record<string, Anime[]> = {};
    
    // Ambil data jadwal untuk hari ini (untuk menghemat rate limit)
    // Di produksi bisa di-loop semua hari jika perlu
    for (const day of days) {
      const data = await fetchWithRetry<{ data: any[] }>(
        `${BASE_URL}/schedules?filter=${day}&limit=12`,
      );
      schedule[day] = data.data.map(mapAnime);
      // Jeda kecil agar tidak kena rate limit Jikan (3 req/sec)
      await new Promise((r) => setTimeout(r, 500));
    }
    return schedule;
  }

  async search(query: string, page = 1, limit = 20): Promise<Anime[]> {
    const data = await fetchWithRetry<{ data: any[] }>(
      `${BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    );
    return data.data.map(mapAnime);
  }

  async getDetail(id: number): Promise<Anime | null> {
    try {
      const data = await fetchWithRetry<{ data: any }>(
        `${BASE_URL}/anime/${id}/full`,
      );
      return mapAnime(data.data);
    } catch {
      return null;
    }
  }

  async getEpisodes(id: number, page = 1): Promise<Episode[]> {
    const data = await fetchWithRetry<{ data: any[] }>(
      `${BASE_URL}/anime/${id}/episodes?page=${page}`,
    );
    return data.data.map((ep) => ({
      id: `${id}-${ep.mal_id}`,
      animeId: id,
      number: ep.mal_id,
      title: ep.title ?? null,
      aired: ep.aired ?? null,
      filler: ep.filler ?? false,
      recap: ep.recap ?? false,
      imageUrl: null,
    }));
  }

  async getRecommendations(id: number): Promise<Anime[]> {
    const data = await fetchWithRetry<{ data: { entry: any }[] }>(
      `${BASE_URL}/anime/${id}/recommendations`,
    );
    return data.data.slice(0, 12).map((item) => mapAnime(item.entry));
  }

  async getStreamLinks(episodeId: string): Promise<StreamLink[]> {
    // Jikan TIDAK menyediakan link streaming.
    // Di sini kita bisa memanggil API eksternal (jika ANIME_API_BASE_URL diisi).
    // Untuk sekarang, kita return array kosong agar UI bisa menampilkan "Server tidak tersedia".
    return [];
  }
}
