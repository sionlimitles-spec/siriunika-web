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

// ===== Playlist (diisi Tahap 2) =====
export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
}

export const playlist: Track[] = [];
