"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, Search, Star } from "lucide-react";
import { categories, tools, type Tool } from "@/config/config";
import { cn } from "@/lib/utils";

const RECENT_KEY = "nexus-recent-tools";
const FAVORITES_KEY = "nexus-favorite-tools";

function readSlugs(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function ToolCard({ tool, index }: { tool: Tool; index: number }): React.ReactElement {
  const Icon = tool.icon;
  const categoryName =
    categories.find((c) => c.id === tool.category)?.name ?? tool.category;

  return (
    <Link
      href={tool.href}
      className="group glass glass-hover relative flex flex-col overflow-hidden p-4 animate-fade-up sm:p-5"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent ring-1 ring-accent/20 transition-colors group-hover:bg-accent/20"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-content-muted ring-1 ring-surface-border">
          {categoryName}
        </span>
      </div>

      <h3 className="mt-4 font-display text-base font-semibold text-content">
        {tool.name}
        {tool.badge ? (
          <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            {tool.badge}
          </span>
        ) : null}
      </h3>

      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-content-muted">
        {tool.description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent">
        Buka tool
        <ArrowUpRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function ToolGrid({ items, query }: { items: Tool[]; query: string }): React.ReactElement {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((tool) => {
      const haystack = [
        tool.name,
        tool.description,
        tool.category,
        ...(tool.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  if (filtered.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center px-6 py-12 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated text-content-muted"
          aria-hidden="true"
        >
          <Search className="h-7 w-7" />
        </div>
        <p className="mt-4 font-display text-sm font-semibold text-content">
          Tidak ada tool yang cocok
        </p>
        <p className="mt-1 max-w-xs text-sm text-content-muted">
          Coba kata kunci lain atau pilih kategori berbeda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((tool, index) => (
        <ToolCard key={tool.slug} tool={tool} index={index} />
      ))}
    </div>
  );
}

export function HomeContent(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    setRecentSlugs(readSlugs(RECENT_KEY));
    setFavoriteSlugs(readSlugs(FAVORITES_KEY));
  }, []);

  const filteredTools = useMemo(
    () =>
      activeCategory === "all"
        ? tools
        : tools.filter((t) => t.category === activeCategory),
    [activeCategory],
  );

  const favoriteTools = useMemo(
    () => tools.filter((t) => favoriteSlugs.includes(t.slug)),
    [favoriteSlugs],
  );

  const recentTools = useMemo(
    () => tools.filter((t) => recentSlugs.includes(t.slug)).slice(0, 4),
    [recentSlugs],
  );

  return (
    <div className="space-y-6">
      <section aria-label="Pencarian dan filter">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tool…"
            aria-label="Cari tool"
            className="h-12 w-full rounded-xl border border-surface-border bg-surface-elevated/60 pl-10 pr-4 text-sm text-content placeholder:text-content-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filter kategori tool"
          className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "border-accent/50 bg-accent/15 text-accent shadow-[0_0_16px_-4px_rgb(var(--accent)/0.4)]"
                    : "border-surface-border bg-surface-elevated/50 text-content-muted hover:border-accent/30 hover:text-content",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {category.name}
              </button>
            );
          })}
        </div>
      </section>

      {favoriteTools.length > 0 ? (
        <section aria-labelledby="favorites-heading">
          <h2
            id="favorites-heading"
            className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-content-muted"
          >
            <Star className="h-4 w-4 text-accent" aria-hidden="true" />
            Favorit
          </h2>
          <ToolGrid items={favoriteTools} query="" />
        </section>
      ) : null}

      {recentTools.length > 0 ? (
        <section aria-labelledby="recent-heading">
          <h2
            id="recent-heading"
            className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-content-muted"
          >
            <Clock3 className="h-4 w-4 text-accent" aria-hidden="true" />
            Terakhir Dipakai
          </h2>
          <ToolGrid items={recentTools} query="" />
        </section>
      ) : null}

      <section aria-labelledby="all-tools-heading">
        <h2
          id="all-tools-heading"
          className="mb-3 font-display text-lg font-bold text-content"
        >
          Semua Tools
        </h2>
        <ToolGrid items={filteredTools} query={query} />
      </section>
    </div>
  );
}
