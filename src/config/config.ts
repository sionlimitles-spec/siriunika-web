import type { LucideIcon } from "lucide-react";
import {
  Clapperboard,
  Gamepad2,
  Sparkles,
  Tv,
  Wrench,
} from "lucide-react";

// ===== Site =====
export interface SiteConfig {
  name: string;
  description: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  userRole: string;
}

export const siteConfig: SiteConfig = {
  name: "All Tools Nexus",
  description:
    "Kumpulan tools hiburan, produktivitas, dan utilitas dalam satu nexus.",
  heroImage: "/images/hero-anime.webp",
  heroTitle: "Selamat datang di Nexus",
  heroSubtitle:
    "Satu tempat untuk semua tool favoritmu. Streaming, utilitas, dan hiburan tanpa pindah tab.",
  userRole: "VVIP",
};

// ===== Categories =====
export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const categories: Category[] = [
  { id: "all", name: "Semua", icon: Sparkles },
  { id: "entertainment", name: "Hiburan", icon: Clapperboard },
  { id: "utility", name: "Utilitas", icon: Wrench },
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
];

// ===== Tools =====
export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  keywords?: string[];
}

export const tools: Tool[] = [
  {
    slug: "anime",
    name: "Nonton Anime",
    description:
      "Streaming anime lengkap dengan jadwal rilis, pencarian, dan daftar tontonan pribadi.",
    category: "entertainment",
    icon: Tv,
    href: "/tools/anime",
    badge: "Baru",
    keywords: ["anime", "streaming", "nonton", "jadwal", "musim"],
  },
];

// ===== Playlist =====
export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
}

/**
 * Playlist global MusicPlayer.
 * Sumber royalty-free yang direkomendasikan:
 *   - https://soundhelix.com  (contoh di bawah, CC/royalty-free)
 *   - https://jamendo.com      (filter CC-BY)
 *   - https://freemusicarchive.org
 *   - https://incompetech.com  (Kevin MacLeod)
 *
 * Untuk file lokal, letakkan di /public/music/ dan pakai src "/music/nama.mp3".
 * Cover: letakkan di /public/images/ atau pakai URL publik.
 *
 * Tambahkan track baru = tambah entry di array ini. MusicPlayer otomatis
 * mendeteksi dan menyimpannya di localStorage.
 */
export const playlist: Track[] = [
  {
    id: "soundhelix-song-1",
    title: "SoundHelix Song 1",
    artist: "T. Schürger",
    cover: "/images/cover-default.svg",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "soundhelix-song-2",
    title: "SoundHelix Song 2",
    artist: "T. Schürger",
    cover: "/images/cover-default.svg",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "soundhelix-song-3",
    title: "SoundHelix Song 3",
    artist: "T. Schürger",
    cover: "/images/cover-default.svg",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];
