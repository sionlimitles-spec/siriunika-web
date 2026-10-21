"use client";

import { useEffect, useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Anime } from "@/lib/anime/types";
import { syncFavorite, syncStatus } from "@/lib/firebase";

const STATUS_OPTIONS = ["Sedang Ditonton", "Rencana", "Selesai", "Dihentikan"] as const;
type WatchStatus = typeof STATUS_OPTIONS[number];
const FAVORITES_KEY = "nexus-anime-favorites";

export function AnimeActions({ anime }: { anime: Anime }): React.ReactElement {
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(`nexus-anime-status-${anime.id}`);
      if (savedStatus && STATUS_OPTIONS.includes(savedStatus as WatchStatus)) {
        setStatus(savedStatus as WatchStatus);
      }
      const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as number[];
      setIsFavorite(favs.includes(anime.id));
    } catch {}
  }, [anime.id]);

  const handleStatusChange = (newStatus: WatchStatus) => {
    const next = status === newStatus ? null : newStatus;
    setStatus(next);
    try {
      if (next) localStorage.setItem(`nexus-anime-status-${anime.id}`, next);
      else localStorage.removeItem(`nexus-anime-status-${anime.id}`);
      
      // Sync ke Firebase (berjalan di background)
      const snap = { id: anime.id, title: anime.title, imageUrl: anime.images.imageUrl, type: anime.type };
      void syncStatus(anime.id, next, snap);
    } catch {}
  };

  const toggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      let favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as number[];
      if (next) favs.push(anime.id);
      else favs = favs.filter((id) => id !== anime.id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));

      // Sync ke Firebase
      const snap = { id: anime.id, title: anime.title, imageUrl: anime.images.imageUrl, type: anime.type };
      void syncFavorite(anime.id, next, snap);
    } catch {}
  };

  return (
    <div className="space-y-4 rounded-xl border border-surface-border bg-surface-elevated p-4">
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
