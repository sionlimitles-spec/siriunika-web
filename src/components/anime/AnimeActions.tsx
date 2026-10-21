"use client";

import { useEffect, useState } from "react";
import { Bookmark, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["Sedang Ditonton", "Rencana", "Selesai", "Dihentikan"] as const;
type WatchStatus = typeof STATUS_OPTIONS[number];

export function AnimeActions({ animeId }: { animeId: number }): React.ReactElement {
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(`nexus-anime-status-${animeId}`);
      if (savedStatus && STATUS_OPTIONS.includes(savedStatus as WatchStatus)) {
        setStatus(savedStatus as WatchStatus);
      }
      const savedRating = localStorage.getItem(`nexus-anime-rating-${animeId}`);
      if (savedRating) setRating(Number(savedRating));
      
      const favs = JSON.parse(localStorage.getItem("nexus-anime-favorites") ?? "[]") as number[];
      setIsFavorite(favs.includes(animeId));
    } catch {
      // abaikan
    }
  }, [animeId]);

  const handleStatusChange = (newStatus: WatchStatus) => {
    const next = status === newStatus ? null : newStatus;
    setStatus(next);
    if (next) localStorage.setItem(`nexus-anime-status-${animeId}`, next);
    else localStorage.removeItem(`nexus-anime-status-${animeId}`);
  };

  const handleRating = (score: number) => {
    const next = rating === score ? 0 : score;
    setRating(next);
    if (next > 0) localStorage.setItem(`nexus-anime-rating-${animeId}`, String(next));
    else localStorage.removeItem(`nexus-anime-rating-${animeId}`);
  };

  const toggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      let favs = JSON.parse(localStorage.getItem("nexus-anime-favorites") ?? "[]") as number[];
      if (next) favs.push(animeId);
      else favs = favs.filter((id) => id !== animeId);
      localStorage.setItem("nexus-anime-favorites", JSON.stringify(favs));
    } catch {
      // abaikan
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-surface-border bg-surface-elevated p-4">
      {/* Status */}
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-content-muted">
          <Bookmark className="h-3.5 w-3.5" /> Status Tontonan
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => handleStatusChange(opt)}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                status === opt
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-surface-border bg-surface text-content-muted hover:border-accent/40 hover:text-content"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-content-muted">
          <Star className="h-3.5 w-3.5" /> Rating Pribadi
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }).map((_, i) => {
            const score = i + 1;
            return (
              <button
                key={score}
                onClick={() => handleRating(score)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-colors",
                  rating >= score
                    ? "bg-accent text-white"
                    : "bg-surface text-content-muted hover:bg-accent/20 hover:text-accent"
                )}
              >
                {score}
              </button>
            );
          })}
        </div>
      </div>

      {/* Favorite */}
      <button
        onClick={toggleFavorite}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors",
          isFavorite
            ? "bg-red-500/15 text-red-500 ring-1 ring-red-500/30"
            : "bg-surface text-content-muted hover:bg-surface-border hover:text-content"
        )}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        {isFavorite ? "Tersimpan di Favorit" : "Tambah ke Favorit"}
      </button>
    </div>
  );
      }
