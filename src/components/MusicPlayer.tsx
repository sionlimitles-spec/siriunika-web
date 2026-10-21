"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Cover({
  src,
  size,
  alt,
}: {
  src: string;
  size: number;
  alt: string;
}): React.ReactElement {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent/5 text-accent"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <Music2 className="h-5 w-5" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-xl object-cover"
      onError={() => setBroken(true)}
      unoptimized
    />
  );
}

function Visualizer({ active }: { active: boolean }): React.ReactElement {
  return (
    <div
      className="flex h-8 items-end gap-0.5"
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-sm bg-accent",
            active ? "animate-visualizer" : "h-1 opacity-30",
          )}
          style={{ animationDelay: `${(i % 8) * 0.12}s` }}
        />
      ))}
    </div>
  );
}

export function MusicPlayer(): React.ReactElement | null {
  const player = useAudioPlayer();
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const didInit = useRef(false);

  // Autoplay sekali jika toggle aktif dan ada track terakhir
  useEffect(() => {
    if (didInit.current) return;
    if (!player.track) return;
    didInit.current = true;
    let autoplay = false;
    try {
      autoplay = localStorage.getItem("nexus-autoplay") === "on";
    } catch {
      autoplay = false;
    }
    if (autoplay) player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.track]);

  const closeExpanded = useCallback(() => setExpanded(false), []);

  if (!player.track) return null;

  const progressPct =
    player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

  return (
    <>
      {/* Mini bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-surface/95 backdrop-blur-glass",
          "pb-[env(safe-area-inset-bottom)]",
        )}
        role="region"
        aria-label="Music player"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left transition-colors hover:bg-accent/5"
            aria-label="Perluas music player"
          >
            <Cover src={player.track.cover} size={40} alt={player.track.title} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-content">
                {player.track.title}
              </p>
              <p className="truncate text-xs text-content-muted">
                {player.track.artist}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={player.toggle}
              aria-label={player.isPlaying ? "Pause" : "Putar"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_18px_-4px_rgb(var(--accent)/0.6)]"
            >
              {player.isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={player.next}
              aria-label="Lagu berikutnya"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-content-muted hover:text-content"
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Buka pemutar lengkap"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-content-muted hover:text-content sm:inline-flex"
            >
              <ChevronUp className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Progress strip */}
        <div
          className="h-0.5 w-full bg-surface-border"
          aria-hidden="true"
        >
          <div
            className="h-full bg-accent transition-[width] duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Expanded sheet */}
      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Pemutar musik lengkap"
          onClick={closeExpanded}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-t-3xl border border-surface-border bg-surface-elevated p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-border sm:hidden" />

            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-content">
                Sekarang Diputar
              </h2>
              <button
                type="button"
                onClick={closeExpanded}
                aria-label="Tutup"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-content-muted hover:text-content"
              >
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <Cover
                  src={player.track.cover}
                  size={200}
                  alt={player.track.title}
                />
                <div className="mt-3 flex justify-center">
                  <Visualizer active={player.isPlaying} />
                </div>
              </div>
              <p className="mt-3 max-w-full truncate text-center font-display text-base font-semibold text-content">
                {player.track.title}
              </p>
              <p className="truncate text-center text-sm text-content-muted">
                {player.track.artist}
              </p>
            </div>

            {/* Progress */}
            <div className="mt-5">
              <input
                type="range"
                min={0}
                max={Math.max(player.duration, 0.1)}
                step={0.1}
                value={player.currentTime}
                onChange={(e) => player.seek(Number(e.target.value))}
                aria-label="Posisi lagu"
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-border accent-[rgb(var(--accent))]"
                style={{
                  background: `linear-gradient(to right, rgb(var(--accent)) ${progressPct}%, rgb(var(--surface-border)) ${progressPct}%)`,
                }}
              />
              <div className="mt-1 flex justify-between text-[11px] tabular-nums text-content-muted">
                <span>{formatTime(player.currentTime)}</span>
                <span>{formatTime(player.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={player.toggleShuffle}
                aria-label="Shuffle"
                aria-pressed={player.shuffle}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full",
                  player.shuffle
                    ? "bg-accent/15 text-accent"
                    : "text-content-muted hover:text-content",
                )}
              >
                <Shuffle className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={player.prev}
                aria-label="Sebelumnya"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-content hover:text-accent"
              >
                <SkipBack className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={player.toggle}
                aria-label={player.isPlaying ? "Pause" : "Putar"}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_24px_-4px_rgb(var(--accent)/0.7)]"
              >
                {player.isPlaying ? (
                  <Pause className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Play className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={player.next}
                aria-label="Berikutnya"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-content hover:text-accent"
              >
                <SkipForward className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={player.cycleRepeat}
                aria-label={`Mode repeat: ${player.repeat}`}
                aria-pressed={player.repeat !== "off"}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full",
                  player.repeat !== "off"
                    ? "bg-accent/15 text-accent"
                    : "text-content-muted hover:text-content",
                )}
              >
                {player.repeat === "one" ? (
                  <Repeat1 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Repeat className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Volume */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  player.setVolume(player.volume > 0 ? 0 : 0.65)
                }
                aria-label={player.volume > 0 ? "Bisukan" : "Aktifkan suara"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-content-muted hover:text-content"
              >
                {player.volume > 0 ? (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={player.volume}
                onChange={(e) => player.setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-border"
              />
            </div>

            {/* Queue toggle */}
            <button
              type="button"
              onClick={() => setShowQueue((v) => !v)}
              aria-expanded={showQueue}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-content-muted transition-colors hover:border-accent/40 hover:text-content"
            >
              <ListMusic className="h-4 w-4" aria-hidden="true" />
              {showQueue ? "Sembunyikan antrian" : "Lihat antrian"}
            </button>

            {showQueue ? (
              <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-surface-border bg-surface">
                {player.tracks.map((track, i) => (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => player.playAt(i)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/10",
                        i === player.index && "bg-accent/10 text-accent",
                      )}
                    >
                      <span className="w-5 text-center tabular-nums text-content-muted">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {track.title}
                        </span>
                        <span className="block truncate text-[11px] text-content-muted">
                          {track.artist}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
              }
