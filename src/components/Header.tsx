"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Search, Settings, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandPalette, SettingsSheet } from "./Overlays";

function ThemeToggle(): React.ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated/60 text-content-muted transition-colors hover:border-accent/40 hover:text-accent"
    >
      {mounted ? (
        isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <span className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

export function Header(): React.ReactElement {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-glass">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/25"
              aria-hidden="true"
            >
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-sm font-bold tracking-wide text-content sm:text-base">
              All Tools <span className="text-accent">Nexus</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Buka pencarian cepat"
              className={cn(
                "hidden md:flex h-11 w-56 items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated/60 px-3 text-sm text-content-muted transition-colors hover:border-accent/40 hover:text-content xl:w-64",
              )}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1 text-left">Cari tool…</span>
              <kbd className="rounded border border-surface-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-content-muted">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Buka pencarian"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated/60 text-content-muted transition-colors hover:border-accent/40 hover:text-accent md:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Buka pengaturan"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated/60 text-content-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
      {settingsOpen ? <SettingsSheet onClose={() => setSettingsOpen(false)} /> : null}
    </>
  );
}
