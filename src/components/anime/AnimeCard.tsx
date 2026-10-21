import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import type { Anime } from "@/lib/anime/types";

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps): React.ReactElement {
  return (
    <Link
      href={`/tools/anime/${anime.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-elevated transition-all hover:border-accent/40 hover:shadow-[0_0_20px_-5px_rgb(var(--accent)/0.3)]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        {anime.images.imageUrl ? (
          <Image
            src={anime.images.imageUrl}
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-content-muted">
            <Play className="h-8 w-8 opacity-20" />
          </div>
        )}
        
        {/* Overlay Hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>

        {/* Badge Episode / Tipe */}
        <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
          {anime.type} {anime.episodes ? `• ${anime.episodes} Ep` : ""}
        </div>

        {/* Rating */}
        {anime.score ? (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-md">
            <Star className="h-3 w-3 fill-current" />
            {anime.score.toFixed(1)}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-content group-hover:text-accent">
          {anime.title}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-content-muted">
          <span>{anime.season ? `${anime.season} ${anime.year}` : anime.year ?? "TBA"}</span>
          <span className="truncate max-w-[60%] text-right">{anime.genres[0] ?? "-"}</span>
        </div>
      </div>
    </Link>
  );
          }
