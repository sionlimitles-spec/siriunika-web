"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock, Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const FAVORITES_KEY = "nexus-anime-favorites";
const HISTORY_KEY = "nexus-anime-history";
const SNAPSHOTS_KEY = "nexus-anime-snapshots";
const STATUS_PREFIX = "nexus-anime-status-";

const STATUS_OPTIONS = ["Sedang Ditonton", "Rencana", "Selesai", "Dihentikan"] as const;
type WatchStatus = typeof STATUS_OPTIONS[number];

interface AnimeSnapshot {
  id: number;
  title: string;
  imageUrl: string;
  type: string;
  episodes: number | null;
}

interface HistoryItem {
  animeId: number;
  episodeNumber: number;
  title: string;
  poster: string;
  timestamp: number;
}

type Tab = "favorites" | "history" | "status";

export default function LibraryPage(): React.ReactElement {
  const [tab, setTab] = useState<Tab>("favorites");
  const [favorites, setFavorites] = useState<AnimeSnapshot[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [statusGroups, setStatusGroups] = useState<Record<WatchStatus, AnimeSnapshot[]>>({
    "Sedang Ditonton": [], "Rencana": [], "Selesai": [], "Dihentikan": [],
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const snapshots = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) ?? "{}") as Record<string, AnimeSnapshot>;
      const favIds = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as number[];
      const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as HistoryItem[];
      
      setFavorites(favIds.map(id => snapshots[String(id)]).filter((s): s is AnimeSnapshot => Boolean(s)));
      setHistory(hist);
      
      const groups: Record<WatchStatus, AnimeSnapshot[]> = {
        "Sedang Ditonton": [], "Rencana": [], "Selesai": [], "Dihentikan": [],
      };
      for (const status of STATUS_OPTIONS) {
        for (const [id, snap] of Object.entries(snapshots)) {
          if (localStorage.getItem(`${STATUS_PREFIX}${id}`) === status) {
            groups[status].push(snap);
          }
        }
      }
      setStatusGroups(groups);
    } catch {}
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-content">Daftar Saya</h1>
          <p className="mt-1 text-sm text-content-muted">Favorit, riwayat, dan status tontonan.</p>
        </div>
        <Link href="/tools/anime" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 text-sm font-medium text-content-muted hover:border-accent/40 hover:text-accent">
          Beranda Anime
        </Link>
      </div>

      <div className="flex gap-2 border-b border-surface-border pb-2">
        {[
          { id: "favorites" as Tab, label: "Favorit", icon: Heart },
          { id: "history" as Tab, label: "Riwayat", icon: Clock },
          { id: "status" as Tab, label: "Status", icon: Bookmark },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors", tab === t.id ? "bg-accent/15 text-accent" : "text-content-muted hover:text-content")}>
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {!mounted ? (
        <p className="text-sm text-content-muted">Memuat...</p>
      ) : tab === "favorites" ? (
        favorites.length === 0 ? <EmptyState text="Belum ada anime favorit." /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {favorites.map(s => <SnapshotCard key={s.id} snap={s} />)}
          </div>
        )
      ) : tab === "history" ? (
        history.length === 0 ? <EmptyState text="Belum ada riwayat tontonan." /> : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <Link key={`${h.animeId}-${h.episodeNumber}-${i}`} href={`/tools/anime/watch/${h.animeId}-${h.episodeNumber}?animeId=${h.animeId}&ep=${h.episodeNumber}&poster=${encodeURIComponent(h.poster)}&title=${encodeURIComponent(h.title)}`} className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-2 transition-colors hover:border-accent/40">
                {h.poster ? (
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md">
                    <Image src={h.poster} alt={h.title} fill sizes="48px" className="object-cover" />
                  </div>
                ) : <div className="h-16 w-12 shrink-0 rounded-md bg-surface" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-content">{h.title}</p>
                  <p className="text-xs text-content-muted">Episode {h.episodeNumber}</p>
                </div>
                <Play className="h-4 w-4 shrink-0 text-accent" />
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-6">
          {STATUS_OPTIONS.map(status => (
            statusGroups[status].length > 0 && (
              <section key={status}>
                <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-content-muted">{status}</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {statusGroups[status].map(s => <SnapshotCard key={s.id} snap={s} />)}
                </div>
              </section>
            )
          ))}
          {Object.values(statusGroups).every(g => g.length === 0) && <EmptyState text="Belum ada anime dengan status." />}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }): React.ReactElement {
  return (
    <div className="glass flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-content-muted">
        <Bookmark className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm text-content-muted">{text}</p>
    </div>
  );
}

function SnapshotCard({ snap }: { snap: AnimeSnapshot }): React.ReactElement {
  return (
    <Link href={`/tools/anime/${snap.id}`} className="group overflow-hidden rounded-xl border border-surface-border bg-surface-elevated transition-colors hover:border-accent/40">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        {snap.imageUrl && <Image src={snap.imageUrl} alt={snap.title} fill sizes="150px" className="object-cover transition-transform group-hover:scale-105" />}
      </div>
      <div className="p-2">
        <p className="line-clamp-2 text-xs font-semibold text-content group-hover:text-accent">{snap.title}</p>
      </div>
    </Link>
  );
}
