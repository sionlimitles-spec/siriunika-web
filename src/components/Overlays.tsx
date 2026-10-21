"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Palette,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { categories, tools } from "@/config/config";
import {
  type AccentColor,
  ACCENT_KEY,
  cn,
  isAccentColor,
} from "@/lib/utils";

// ===== Command Palette =====
export function CommandPalette({
  onClose,
}: {
  onClose: () => void;
}): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = tools.map((tool) => ({
      id: tool.slug,
      label: tool.name,
      description: tool.description,
      href: tool.href,
      categoryName:
        categories.find((c) => c.id === tool.category)?.name ?? tool.category,
    }));
    if (!q) return items;
    return items.filter((item) =>
      `${item.label} ${item.description} ${item.categoryName}`
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  const handleSelect = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian cepat"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-surface-border bg-surface-elevated shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-surface-border px-4">
          <Search className="h-4 w-4 shrink-0 text-content-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tool atau halaman…"
            aria-label="Cari tool"
            className="h-12 flex-1 bg-transparent text-sm text-content placeholder:text-content-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pencarian"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-content-muted hover:text-content"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-content-muted">
              Tidak ada hasil untuk “{query}”.
            </li>
          ) : (
            results.map((item) => (
              <li key={item.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-content">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-content-muted">
                      {item.categoryName} &middot; {item.description}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="border-t border-surface-border px-4 py-2 text-[10px] text-content-muted">
          Tekan <kbd className="rounded bg-surface px-1 py-0.5">Esc</kbd> untuk menutup
          &middot; <kbd className="rounded bg-surface px-1 py-0.5">Ctrl K</kbd> untuk
          buka/tutup
        </div>
      </div>
    </div>
  );
}

// ===== Settings Sheet =====
const accents: { id: AccentColor; label: string; swatch: string }[] = [
  { id: "red", label: "Merah", swatch: "bg-red-600" },
  { id: "blue", label: "Biru", swatch: "bg-blue-600" },
  { id: "purple", label: "Ungu", swatch: "bg-purple-600" },
  { id: "green", label: "Hijau", swatch: "bg-green-600" },
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface px-3 py-2 text-left transition-colors hover:border-accent/30"
    >
      <span>
        <span className="block text-sm font-medium text-content">{label}</span>
        <span className="block text-xs text-content-muted">{description}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-surface-border",
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function SettingsSheet({
  onClose,
}: {
  onClose: () => void;
}): React.ReactElement {
  const [accent, setAccent] = useState<AccentColor>("red");
  const [animations, setAnimations] = useState(true);
  const [particles, setParticles] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACCENT_KEY);
      if (stored && isAccentColor(stored)) {
        setAccent(stored);
        document.documentElement.dataset.accent = stored;
      }
      if (localStorage.getItem("nexus-animations") === "off") setAnimations(false);
      if (localStorage.getItem("nexus-particles") === "on") setParticles(true);
    } catch {
      // abaikan
    }
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const updateAccent = useCallback((next: AccentColor) => {
    setAccent(next);
    document.documentElement.dataset.accent = next;
    try {
      localStorage.setItem(ACCENT_KEY, next);
    } catch {
      // abaikan
    }
  }, []);

  const updateAnimations = useCallback((value: boolean) => {
    setAnimations(value);
    try {
      localStorage.setItem("nexus-animations", value ? "on" : "off");
    } catch {
      // abaikan
    }
  }, []);

  const updateParticles = useCallback((value: boolean) => {
    setParticles(value);
    try {
      localStorage.setItem("nexus-particles", value ? "on" : "off");
    } catch {
      // abaikan
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Pengaturan"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl border border-surface-border bg-surface-elevated p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-border sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-content">Pengaturan</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-content-muted hover:text-content"
          >
            Tutup
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <section aria-label="Warna aksen">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-content">
              <Palette className="h-4 w-4 text-accent" aria-hidden="true" />
              Warna aksen
            </div>
            <div className="flex gap-2">
              {accents.map((item) => {
                const active = accent === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateAccent(item.id)}
                    aria-label={`Pilih aksen ${item.label}`}
                    aria-pressed={active}
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-xl ring-2 transition-transform",
                      active
                        ? "ring-accent"
                        : "ring-transparent hover:ring-surface-border",
                    )}
                  >
                    <span className={cn("h-7 w-7 rounded-lg", item.swatch)} />
                    {active ? (
                      <Check className="absolute h-4 w-4 text-white" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-label="Efek visual">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-content">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              Efek visual
            </div>
            <div className="space-y-2">
              <ToggleRow
                label="Animasi"
                description="Animasi transisi dan hover"
                checked={animations}
                onChange={updateAnimations}
              />
              <ToggleRow
                label="Partikel background"
                description="Efek partikel ringan (aktif di Tahap 2)"
                checked={particles}
                onChange={updateParticles}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
