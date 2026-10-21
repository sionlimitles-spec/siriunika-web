"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dice5, Clock, AlertCircle } from "lucide-react";
import { AnimeHeroSlider } from "@/components/anime/AnimeHeroSlider";
import { AnimeCard } from "@/components/anime/AnimeCard";
import type { Anime } from "@/lib/anime/types";

export default function AnimeHomePage(): React.ReactElement {
  const [trending, setTrending] = useState<Anime[]>([]);
  const [latest, setLatest] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [randomId, setRandomId] = useState(1);

  useEffect(() => {
    setRandomId(Math.floor(Math.random() * 50000) + 1);

    async function fetchData() {
      try {
        const [resTrending, resLatest] = await Promise.all([
          fetch("/api/anime/trending"),
          fetch("/api/anime/latest"),
        ]);
        
        const dataTrending = await resTrending.json();
        const dataLatest = await resLatest.json();

        setTrending(dataTrending.data ?? []);
        setLatest(dataLatest.data ?? []);
      } catch {
        setErrorMsg("Gagal memuat data dari server. Periksa koneksi internetmu.");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
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

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Tampilan Loading (Skeleton) */}
      {loading ? (
        <div className="space-y-8">
          <div>
            <div className="mb-3 h-6 w-40 animate-pulse rounded bg-surface-elevated" />
            <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-surface-elevated sm:w-[600px]" />
          </div>
          <div>
            <div className="mb-3 h-6 w-40 animate-pulse rounded bg-surface-elevated" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] w-full animate-pulse rounded-xl bg-surface-elevated" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <section aria-labelledby="trending-heading">
            <h2 id="trending-heading" className="mb-3 font-display text-lg font-bold text-content">
              Trending Ming Ini
            </h2>
            <AnimeHeroSlider animes={trending} />
          </section>

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
        </>
      )}
    </div>
  );
}
