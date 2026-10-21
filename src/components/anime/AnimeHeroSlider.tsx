"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import type { Anime } from "@/lib/anime/types";

export function AnimeHeroSlider({ animes }: { animes: Anime[] }): React.ReactElement {
  if (animes.length === 0) return <div className="text-content-muted">Tidak ada data trending.</div>;

  return (
    <div className="relative -mx-4 sm:mx-0">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {animes.map((anime) => (
          <Link
            key={anime.id}
            href={`/tools/anime/${anime.id}`}
            className="group relative aspect-[16/9] w-[85vw] shrink-0 snap-center overflow-hidden rounded-2xl border border-surface-border sm:w-[600px]"
          >
            {anime.images.largeImageUrl ? (
              <Image
                src={anime.images.largeImageUrl}
                alt={anime.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-surface-elevated" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  {anime.type}
                </span>
                {anime.score && (
                  <span className="flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-md">
                    <Star className="h-3 w-3 fill-current" /> {anime.score.toFixed(1)}
                  </span>
                )}
              </div>
              <h2 className="line-clamp-1 font-display text-xl font-bold text-white sm:text-2xl">
                {anime.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-xs text-white/70 sm:text-sm">
                {anime.synopsis ?? "Sinopsis belum tersedia."}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                <Play className="h-3.5 w-3.5 fill-current" /> Tonton Sekarang
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
