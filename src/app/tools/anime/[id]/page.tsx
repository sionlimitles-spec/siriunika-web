import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, PlayCircle, Star, Tv, Bookmark, AlertCircle } from "lucide-react";
import { getAnimeProvider } from "@/lib/anime";
import { AnimeActions } from "@/components/anime/AnimeActions";
import { AnimeCard } from "@/components/anime/AnimeCard";
import type { Anime } from "@/lib/anime/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const provider = getAnimeProvider();
    const anime = await provider.getDetail(Number(id));
    if (!anime) return { title: "Anime Tidak Ditemukan" };
    return { title: anime.title, description: anime.synopsis?.slice(0, 160) };
  } catch {
    return { title: "Detail Anime" };
  }
}

// PENTING: Jangan prerender saat build.
export const dynamic = 'force-dynamic';

export default async function AnimeDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const animeId = Number(id);
  
  if (isNaN(animeId)) notFound();

  const provider = getAnimeProvider();
  
  let anime: Anime | null = null;
  let recommendations: Anime[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let episodes: any[] = [];
  let errorMsg = "";

  try {
    const [a, r, e] = await Promise.all([
      provider.getDetail(animeId),
      provider.getRecommendations(animeId).catch(() => []),
      provider.getEpisodes(animeId).catch(() => []),
    ]);
    anime = a;
    recommendations = r;
    episodes = e;
  } catch (err) {
    console.error("Gagal memuat detail anime:", err);
    errorMsg = "Gagal memuat detail anime. Silakan coba lagi.";
  }

  if (!anime && !errorMsg) notFound();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <Link
          href="/tools/anime"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <Link
          href="/tools/anime/library"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Bookmark className="h-4 w-4" /> Daftar Saya
        </Link>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {anime && (
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-surface-border shadow-2xl">
              <Image
                src={anime.images.largeImageUrl || anime.images.imageUrl}
                alt={anime.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
            <AnimeActions anime={anime} />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-content sm:text-3xl">
                {anime.title}
              </h1>
              {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                <p className="mt-1 text-sm text-content-muted">{anime.titleEnglish}</p>
              )}
              
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-1 text-xs font-bold text-accent ring-1 ring-accent/25">
                  <Tv className="h-3.5 w-3.5" /> {anime.type}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-1 text-xs font-bold text-content-muted ring-1 ring-surface-border">
                  <PlayCircle className="h-3.5 w-3.5" /> {anime.episodes ?? "?"} Episode
                </span>
                {anime.score && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/15 px-2 py-1 text-xs font-bold text-yellow-500 ring-1 ring-yellow-500/25">
                    <Star className="h-3.5 w-3.5 fill-current" /> {anime.score.toFixed(2)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-1 text-xs font-bold text-content-muted ring-1 ring-surface-border">
                  <Calendar className="h-3.5 w-3.5" /> {anime.status}
                </span>
              </div>
            </div>

            <div>
              <h2 className="mb-2 font-display text-lg font-bold text-content">Sinopsis</h2>
              <p className="text-sm leading-relaxed text-content-muted">
                {anime.synopsis ?? "Sinopsis belum tersedia."}
              </p>
            </div>

            <div>
              <h2 className="mb-2 font-display text-lg font-bold text-content">Genre</h2>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span key={genre} className="rounded-full border border-surface-border bg-surface px-3 py-1 text-xs font-medium text-content-muted">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-bold text-content">Daftar Episode</h2>
              {episodes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {episodes.map((ep) => (
                    <Link
                      key={ep.id}
                      href={`/tools/anime/watch/${ep.id}?animeId=${anime.id}&ep=${ep.number}&poster=${encodeURIComponent(anime.images.imageUrl)}&title=${encodeURIComponent(anime.title)}`}
                      className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-content transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      <span className="truncate">Ep {ep.number}</span>
                      <PlayCircle className="h-4 w-4 shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-content-muted">Belum ada data episode.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="pt-6 border-t border-surface-border">
          <h2 className="mb-3 font-display text-lg font-bold text-content">Rekomendasi Anime Serupa</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recommendations.map((rec) => (
              <AnimeCard key={rec.id} anime={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
