import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clapperboard, Clock, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Nonton Anime",
  description: "Streaming anime — segera hadir di All Tools Nexus.",
};

export default function AnimePlaceholderPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated/60 px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:border-accent/40 hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Home
      </Link>

      <div className="glass mt-4 overflow-hidden">
        <div className="relative border-b border-surface-border bg-gradient-to-br from-accent/20 via-accent/5 to-transparent p-8 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/25"
            aria-hidden="true"
          >
            <Clapperboard className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-content sm:text-3xl">
            Nonton Anime
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            Tool streaming anime sedang dalam pengembangan
          </p>
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-content">
                Status: Segera Hadir
              </p>
              <p className="mt-0.5 text-xs text-content-muted">
                Halaman ini adalah placeholder. Fitur lengkap akan dibangun
                pada tahap berikutnya.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Yang akan hadir
            </p>
            <ul className="space-y-1.5 text-sm text-content-muted">
              <li>Beranda dengan hero slider trending & jadwal rilis</li>
              <li>Detail anime: poster, sinopsis, trailer, karakter</li>
              <li>Player dengan PiP, kecepatan putar, dan mode teater</li>
              <li>Daftar tontonan pribadi (sedang ditonton, rencana, selesai)</li>
              <li>Komentar per episode dan daftar favorit tersinkron</li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Jelajahi tool lain
          </Link>
        </div>
      </div>
    </div>
  );
}
