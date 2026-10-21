"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Bookmark, ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import { VideoPlayer } from "@/components/anime/VideoPlayer";
import type { Episode, StreamLink } from "@/lib/anime/types";
import { cn } from "@/lib/utils";

const DEMO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const HISTORY_KEY = "nexus-anime-history";
const WATCHED_KEY = "nexus-anime-watched";
const REPORTS_KEY = "nexus-anime-reports";

interface HistoryItem {
  animeId: number;
  episodeNumber: number;
  title: string;
  poster: string;
  timestamp: number;
}

export default function WatchPage(): React.ReactElement {
  const params = useParams<{ episodeId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const episodeId = params.episodeId;
  const animeId = Number(searchParams.get("animeId") ?? 0);
  const episodeNumber = Number(searchParams.get("ep") ?? 0);
  const title = searchParams.get("title") ?? "Anime";
  const poster = searchParams.get("poster") ?? "";

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [streams, setStreams] = useState<StreamLink[]>([]);
  const [selectedServer, setSelectedServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markedWatched, setMarkedWatched] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [autoNext, setAutoNext] = useState(true);

  useEffect(() => {
    if (!animeId) return;
    void Promise.all([
      fetch(`/api/anime/episodes/${animeId}`).then(r => r.json()).then(d => setEpisodes(d.data ?? [])).catch(() => setEpisodes([])),
      fetch(`/api/anime/stream/${episodeId}`).then(r => r.json()).then(d => setStreams(d.data ?? [])).catch(() => setStreams([])),
    ]).finally(() => setLoading(false));
  }, [animeId, episodeId]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as HistoryItem[];
      const filtered = history.filter(h => !(h.animeId === animeId && h.episodeNumber === episodeNumber));
      filtered.unshift({ animeId, episodeNumber, title, poster, timestamp: Date.now() });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 30)));
      const watched = JSON.parse(localStorage.getItem(WATCHED_KEY) ?? "[]") as string[];
      setMarkedWatched(watched.includes(episodeId));
    } catch {}
  }, [animeId, episodeNumber, title, poster, episodeId]);

  const { prevEpisode, nextEpisode } = useMemo(() => {
    const idx = episodes.findIndex(e => e.number === episodeNumber);
    return {
      prevEpisode: idx > 0 ? episodes[idx - 1] : null,
      nextEpisode: idx >= 0 && idx < episodes.length - 1 ? episodes[idx + 1] : null,
    };
  }, [episodes, episodeNumber]);

  const goToEpisode = useCallback((ep: Episode) => {
    router.push(`/tools/anime/watch/${ep.id}?animeId=${animeId}&ep=${ep.number}&poster=${encodeURIComponent(poster)}&title=${encodeURIComponent(title)}`);
  }, [animeId, poster, title, router]);

  const handleEnded = useCallback(() => {
    if (autoNext && nextEpisode) goToEpisode(nextEpisode);
  }, [autoNext, nextEpisode, goToEpisode]);

  const toggleWatched = useCallback(() => {
    try {
      const watched = JSON.parse(localStorage.getItem(WATCHED_KEY) ?? "[]") as string[];
      let next: string[];
      if (watched.includes(episodeId)) {
        next = watched.filter(id => id !== episodeId);
        setMarkedWatched(false);
      } else {
        next = [...watched, episodeId];
        setMarkedWatched(true);
      }
      localStorage.setItem(WATCHED_KEY, JSON.stringify(next));
    } catch {}
  }, [episodeId]);

  const submitReport = useCallback(() => {
    if (!reportReason.trim()) return;
    try {
      const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) ?? "[]") as unknown[];
      reports.push({ episodeId, animeId, reason: reportReason.trim(), timestamp: Date.now() });
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch {}
    setReportSent(true);
    setTimeout(() => { setShowReport(false); setReportSent(false); setReportReason(""); }, 1500);
  }, [episodeId, animeId, reportReason]);

  const currentVideoSrc = streams[selectedServer]?.url ?? DEMO_VIDEO;

  return (
    <div className="space-y-6 pb-10">
      <Link href={`/tools/anime/${animeId}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:border-accent/40 hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Detail
      </Link>

      <div>
        <h1 className="font-display text-xl font-bold text-content sm:text-2xl">
          {title} <span className="text-accent">· Episode {episodeNumber}</span>
        </h1>
        {loading ? (
          <p className="mt-1 text-xs text-content-muted">Memuat data...</p>
        ) : streams.length === 0 ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-yellow-500">
            <AlertTriangle className="h-3.5 w-3.5" /> Server streaming belum tersedia. Menampilkan video demo.
          </p>
        ) : null}
      </div>

      <VideoPlayer src={currentVideoSrc} poster={poster || undefined} title={`${title} - Ep ${episodeNumber}`} onEnded={handleEnded} />

      {streams.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-content-muted">Pilih Server</p>
          <div className="flex flex-wrap gap-2">
            {streams.map((s, i) => (
              <button key={`${s.server}-${i}`} onClick={() => setSelectedServer(i)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium", selectedServer === i ? "border-accent bg-accent/15 text-accent" : "border-surface-border bg-surface text-content-muted hover:border-accent/40")}>
                {s.server} · {s.quality}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {prevEpisode && (
          <button onClick={() => goToEpisode(prevEpisode)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-content-muted transition-colors hover:border-accent/40 hover:text-content">
            <ChevronLeft className="h-4 w-4" /> Ep {prevEpisode.number}
          </button>
        )}
        {nextEpisode && (
          <button onClick={() => goToEpisode(nextEpisode)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-content-muted transition-colors hover:border-accent/40 hover:text-content">
            Ep {nextEpisode.number} <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <button onClick={toggleWatched} className={cn("inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold", markedWatched ? "bg-green-500/15 text-green-500 ring-1 ring-green-500/30" : "bg-surface-elevated text-content-muted hover:text-content")}>
          <Bookmark className={cn("h-3.5 w-3.5", markedWatched && "fill-current")} />
          {markedWatched ? "Sudah Ditonton" : "Tandai Ditonton"}
        </button>
        <button onClick={() => setShowReport(true)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-content-muted transition-colors hover:border-red-500/40 hover:text-red-500">
          <AlertTriangle className="h-3.5 w-3.5" /> Laporkan Rusak
        </button>
        <label className="ml-auto inline-flex items-center gap-2 text-xs text-content-muted">
          <input type="checkbox" checked={autoNext} onChange={e => setAutoNext(e.target.checked)} className="accent-accent" />
          Auto-next
        </label>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-content">Daftar Episode</h2>
        {episodes.length === 0 ? (
          <p className="text-sm text-content-muted">Belum ada data episode.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8">
            {episodes.map(ep => (
              <button key={ep.id} onClick={() => goToEpisode(ep)} className={cn("rounded-lg border px-2 py-2 text-xs font-medium transition-colors", ep.number === episodeNumber ? "border-accent bg-accent text-white" : "border-surface-border bg-surface-elevated text-content-muted hover:border-accent/40 hover:text-content")}>
                Ep {ep.number}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-surface-border bg-surface-elevated p-4">
        <h2 className="mb-2 font-display text-lg font-bold text-content">Komentar</h2>
        <p className="text-sm text-content-muted">Fitur komentar akan aktif setelah integrasi Firebase.</p>
      </section>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowReport(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-elevated p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-content">Laporkan Link Rusak</h3>
              <button onClick={() => setShowReport(false)} className="text-content-muted hover:text-content"><X className="h-4 w-4" /></button>
            </div>
            {reportSent ? (
              <p className="mt-4 text-sm text-green-500">Terima kasih, laporan Anda sudah diterima.</p>
            ) : (
              <>
                <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Jelaskan masalahnya (misal: video tidak muncul)" className="mt-3 h-24 w-full resize-none rounded-lg border border-surface-border bg-surface p-2 text-sm text-content placeholder:text-content-muted focus:border-accent/50 focus:outline-none" />
                <button onClick={submitReport} disabled={!reportReason.trim()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 text-sm font-semibold text-white disabled:opacity-50">
                  <Send className="h-4 w-4" /> Kirim Laporan
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
                                      }
