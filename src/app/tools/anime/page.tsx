import type { Metadata } from "next";
import Link from "next/link";
import { Dice5, Clock } from "lucide-react";
import { getAnimeProvider } from "@/lib/anime";
import { AnimeHeroSlider } from "@/components/anime/AnimeHeroSlider";
import { AnimeCard } from "@/components/anime/AnimeCard";

export const metadata: Metadata = {
  title: "Nonton Anime",
  description: "Streaming anime terbaru dan populer di All Tools Nexus.",
};

// Cache halaman selama 1 jam
export const revalidate = 3600;

export default async function AnimeHomePage(): Promise<React.ReactElement> {
  const provider = getAnimeProvider();
  
  // Ambil data paralel
  const [trending, latest] = await Promise.all([
    provider.getTrending(),
    provider.getLatest(),
  ]);

  // ID acak sederhana (MAL ID range 1 - 50000+)
  const randomId = Math.floor(Math.random() * 50000) + 1;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-content sm:text-3xl">
            Beranda Anime
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            Jelajahi anime musim ini dan trending.
          </p>
        </div>
        <Link
          href={`/tools/anime/${randomId}`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent/15 px-4 py-2 text-sm font-semibold text-accent ring-1 ring-accent/30 transition-colors hover:bg-accent hover:text-white"
        >
          <Dice5 className="h-4 w-4" /> Anime Acak
        </Link>
      </div>

      {/* Trending Slider */}
      <section aria-labelledby="trending-heading">
        <h2 id="trending-heading" className="mb-3 font-display text-lg font-bold text-content">
          Trending Ming Ini
        </h2>
        <AnimeHeroSlider animes={trending} />
      </section>

      {/* Latest Grid */}
      <section aria-labelledby="latest-heading">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          <h2 id="latest-heading" className="font-display text-lg font-bold text-content">
            Rilis Terbaru
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {latest.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>
    </div>
  );
}
